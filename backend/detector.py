from pathlib import Path
import cv2

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None


BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = (
    BASE_DIR /
    "models" /
    "construction_ppe.pt"
)


class SiteDetector:

    def __init__(self):

        self.model = None
        self.model_available = False

        if YOLO is None:

            print(
                "Ultralytics is not installed."
            )

            return

        if not MODEL_PATH.exists():

            print(
                "YOLO model not found:"
            )

            print(MODEL_PATH)

            print(
                "Place construction_ppe.pt "
                "inside backend/models/"
            )

            return

        try:

            self.model = YOLO(
                str(MODEL_PATH)
            )

            self.model_available = True

            print(
                "Construction PPE model loaded."
            )

        except Exception as error:

            print(
                "Could not load YOLO model:"
            )

            print(error)


    def analyze(
        self,
        file_path
    ):

        if file_path is None:

            return self.empty_result()


        if not Path(file_path).exists():

            return self.empty_result()


        if not self.model_available:

            return self.no_model_result()


        try:

            extension = (
                Path(file_path)
                .suffix
                .lower()
            )


            image_extensions = {
                ".jpg",
                ".jpeg",
                ".png",
                ".bmp",
                ".webp"
            }


            if extension in image_extensions:

                return self.analyze_image(
                    str(file_path)
                )


            return self.analyze_video(
                str(file_path)
            )


        except Exception as error:

            print(
                "YOLO analysis error:"
            )

            print(error)


            result = self.empty_result()

            result["status"] = "ERROR"

            result["message"] = str(error)

            return result


    def analyze_image(
        self,
        path
    ):

        frame = cv2.imread(path)


        if frame is None:

            return self.empty_result()


        results = self.model.predict(
            source=frame,
            conf=0.35,
            verbose=False
        )


        return self.process_result(
            results[0]
        )


    def analyze_video(
        self,
        path
    ):

        capture = cv2.VideoCapture(
            path
        )


        if not capture.isOpened():

            return self.empty_result()


        total_frames = 0

        analyzed_frames = 0

        combined = {}


        while True:

            success, frame = (
                capture.read()
            )


            if not success:
                break


            total_frames += 1


            # Analyze every 10th frame.

            if total_frames % 10 != 0:

                continue


            analyzed_frames += 1


            results = self.model.predict(
                source=frame,
                conf=0.35,
                verbose=False
            )


            frame_counts = (
                self.get_counts(
                    results[0]
                )
            )


            for label, count in (
                frame_counts.items()
            ):

                combined[label] = max(
                    combined.get(
                        label,
                        0
                    ),
                    count
                )


            if analyzed_frames >= 30:

                break


        capture.release()


        return self.counts_to_result(
            combined
        )


    def process_result(
        self,
        result
    ):

        counts = self.get_counts(
            result
        )


        return self.counts_to_result(
            counts
        )


    def get_counts(
        self,
        result
    ):

        counts = {}


        if result.boxes is None:

            return counts


        names = result.names


        for cls in result.boxes.cls:

            class_id = int(
                cls.item()
            )


            label = str(
                names[class_id]
            ).lower()


            counts[label] = (
                counts.get(
                    label,
                    0
                ) + 1
            )


        return counts


    def counts_to_result(
        self,
        counts
    ):

        worker_labels = {
            "person",
            "worker"
        }


        workers = sum(
            count
            for label, count
            in counts.items()
            if label in worker_labels
        )


        helmet = self.count_label(
            counts,
            [
                "helmet",
                "hardhat",
                "helmet_on"
            ]
        )


        vest = self.count_label(
            counts,
            [
                "vest",
                "safety_vest"
            ]
        )


        boots = self.count_label(
            counts,
            [
                "boots",
                "boot"
            ]
        )


        harness = self.count_label(
            counts,
            [
                "harness",
                "safety_harness"
            ]
        )


        no_helmet = self.count_label(
            counts,
            [
                "no_helmet",
                "no helmet"
            ]
        )


        no_vest = self.count_label(
            counts,
            [
                "no_vest",
                "no vest"
            ]
        )


        no_boots = self.count_label(
            counts,
            [
                "no_boots",
                "no boots"
            ]
        )


        violations = (
            no_helmet +
            no_vest +
            no_boots
        )


        if workers == 0:

            compliance = 0

            safe_workers = 0

        else:

            compliance = round(
                max(
                    0,
                    (
                        workers -
                        violations
                    )
                    /
                    workers
                    *
                    100
                )
            )


            safe_workers = max(
                0,
                workers -
                violations
            )


        ppe = {

            "helmet":
                self.compliance(
                    workers,
                    helmet,
                    no_helmet
                ),

            "vest":
                self.compliance(
                    workers,
                    vest,
                    no_vest
                ),

            "harness":
                self.compliance(
                    workers,
                    harness,
                    0
                ),

            "boots":
                self.compliance(
                    workers,
                    boots,
                    no_boots
                )

        }


        worker_list = []


        for index in range(
            min(workers, 50)
        ):

            worker_number = (
                index + 1
            )


            if worker_number <= safe_workers:

                status = "SAFE"

                risk = "Low"

                ppe_status = "Compliant"

            else:

                status = "CRITICAL"

                risk = "High"

                ppe_status = "Violation"


            worker_list.append({

                "id":
                    f"W-{worker_number:03d}",

                "status":
                    status,

                "ppe":
                    ppe_status,

                "risk":
                    risk

            })


        return {

            "status":
                "COMPLETED",

            "workers_detected":
                workers,

            "safe_workers":
                safe_workers,

            "violations":
                violations,

            "overall_compliance":
                compliance,

            "ppe":
                ppe,

            "workers":
                worker_list,

            "detections":
                counts

        }


    def count_label(
        self,
        counts,
        labels
    ):

        total = 0


        for label in labels:

            total += counts.get(
                label.lower(),
                0
            )


        return total


    def compliance(
        self,
        workers,
        detected,
        violations
    ):

        if workers <= 0:

            return 0


        if detected == 0 and violations == 0:

            return 0


        value = (
            detected /
            workers *
            100
        )


        return round(
            max(
                0,
                min(
                    100,
                    value
                )
            )
        )


    def empty_result(
        self
    ):

        return {

            "status":
                "COMPLETED",

            "workers_detected":
                0,

            "safe_workers":
                0,

            "violations":
                0,

            "overall_compliance":
                0,

            "ppe": {

                "helmet": 0,

                "vest": 0,

                "harness": 0,

                "boots": 0

            },

            "workers": [],

            "detections": {}

        }


    def no_model_result(
        self
    ):

        result = self.empty_result()


        result["status"] = (
            "MODEL_NOT_FOUND"
        )


        result["message"] = (
            "No trained construction PPE "
            "YOLO model was found. Place "
            "construction_ppe.pt inside "
            "backend/models/."
        )


        return result


    def demo_result(
        self
    ):

        return self.empty_result()