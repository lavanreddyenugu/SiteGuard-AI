from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil

from detector import SiteDetector
from emergency_engine import EmergencyEngine


app = FastAPI(
    title="SiteGuard AI Backend",
    version="2.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = BASE_DIR / "uploads"

MODEL_DIR = BASE_DIR / "models"

UPLOAD_DIR.mkdir(exist_ok=True)

MODEL_DIR.mkdir(exist_ok=True)


detector = SiteDetector()

emergency_engine = EmergencyEngine()


@app.get("/")
def home():

    return {
        "message": "SiteGuard AI Backend Running",
        "status": "ONLINE"
    }


@app.get("/api/health")
def health():

    return {
        "status": "ONLINE",
        "model_available": detector.model_available
    }


@app.get("/api/stats")
def stats():

    return detector.empty_result()


@app.post("/api/analyze")
async def analyze(
    source: str = Form(...),
    file: UploadFile | None = File(None)
):

    if file is None:

        return {
            "status": "COMPLETED",
            "source": source,
            **detector.empty_result()
        }


    safe_filename = Path(
        file.filename
    ).name


    saved_file = (
        UPLOAD_DIR /
        safe_filename
    )


    with open(
        saved_file,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )


    result = detector.analyze(
        saved_file
    )


    result["source"] = source

    result["file"] = safe_filename


    return result


@app.post("/api/emergency/test")
def emergency_test():

    incident = (
        emergency_engine
        .create_incident("FIRE")
    )

    return incident


@app.get(
    "/api/emergency/{incident_id}"
)
def emergency_status(
    incident_id: str
):

    result = (
        emergency_engine
        .get_status(incident_id)
    )


    if not result:

        return {
            "error":
                "Incident not found"
        }


    return result


@app.post(
    "/api/emergency/{incident_id}/acknowledge"
)
def acknowledge(
    incident_id: str
):

    result = (
        emergency_engine
        .acknowledge(incident_id)
    )


    if not result:

        return {
            "error":
                "Incident not found"
        }


    return result


@app.post(
    "/api/emergency/{incident_id}/resolve"
)
def resolve(
    incident_id: str
):

    result = (
        emergency_engine
        .resolve(incident_id)
    )


    if not result:

        return {
            "error":
                "Incident not found"
        }


    return result