// =====================================================
// SITEGUARD AI - DEMO SCANNING SYSTEM
// =====================================================

let selectedSource = null;
let cameraStream = null;


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("SiteGuard AI loaded");

    // Check which page is open
    const currentPage =
        window.location.pathname.split("/").pop();

    if (currentPage === "scanning.html" || currentPage === "") {
        initializeScanning();
    }

    if (currentPage === "dashboard.html") {
        loadDashboard();
    }

    if (currentPage === "emergency.html") {
        initializeEmergency();
    }

});


// =====================================================
// SCANNING INITIALIZATION
// =====================================================

function initializeScanning() {

    const fileSection =
        document.getElementById("fileSection");

    const progressSection =
        document.getElementById("progressSection");

    const scanResult =
        document.getElementById("scanResult");

    if (fileSection) {
        fileSection.style.display = "none";
    }

    if (progressSection) {
        progressSection.style.display = "none";
    }

    if (scanResult) {
        scanResult.style.display = "none";
    }

}


// =====================================================
// SELECT CAMERA SOURCE
// =====================================================

function selectSource(source, card) {

    selectedSource = source;

    // Remove previous selection
    document
        .querySelectorAll(".scan-card")
        .forEach(function (item) {

            item.classList.remove("selected");

        });

    // Select current card
    if (card) {
        card.classList.add("selected");
    }

    const selectedText =
        document.getElementById("selectedSource");

    if (selectedText) {
        selectedText.textContent = source;
    }


    const cameraSection =
        document.getElementById("cameraSection");

    const fileSection =
        document.getElementById("fileSection");

    const cameraMessage =
        document.getElementById("cameraMessage");


    // ==========================================
    // MOBILE CAMERA
    // ==========================================

    if (source === "Mobile Camera") {

        if (fileSection) {
            fileSection.style.display = "none";
        }

        if (cameraSection) {
            cameraSection.style.display = "block";
        }

        startCamera();

    }


    // ==========================================
    // DRONE / CCTV
    // ==========================================

    else {

        stopCamera();

        if (cameraSection) {
            cameraSection.style.display = "none";
        }

        if (fileSection) {
            fileSection.style.display = "block";
        }

    }

}


// =====================================================
// START CAMERA
// =====================================================

async function startCamera() {

    const video =
        document.getElementById("cameraPreview");

    const message =
        document.getElementById("cameraMessage");

    if (!video) {
        return;
    }

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        video.srcObject = cameraStream;

        if (message) {
            message.style.display = "none";
        }

    }

    catch (error) {

        console.error(error);

        if (message) {

            message.style.display = "block";

            message.innerHTML =
                "⚠ Camera permission denied.<br>" +
                "Please allow camera access.";

        }

    }

}


// =====================================================
// STOP CAMERA
// =====================================================

function stopCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function (track) {

                track.stop();

            });

        cameraStream = null;

    }

}


// =====================================================
// CAPTURE CAMERA FRAME
// =====================================================

function captureCameraFrame() {

    return new Promise(function (resolve, reject) {

        const video =
            document.getElementById("cameraPreview");

        if (!video) {

            reject(
                new Error("Camera not available")
            );

            return;

        }

        if (
            video.videoWidth === 0 ||
            video.videoHeight === 0
        ) {

            reject(
                new Error("Camera frame not ready")
            );

            return;

        }


        const canvas =
            document.createElement("canvas");

        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;


        const context =
            canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );


        canvas.toBlob(
            function (blob) {

                if (!blob) {

                    reject(
                        new Error(
                            "Unable to capture camera frame"
                        )
                    );

                    return;

                }

                resolve(blob);

            },
            "image/jpeg",
            0.90
        );

    });

}


// =====================================================
// START AI SCAN
// =====================================================

async function startAIScan() {

    // Check source
    if (!selectedSource) {

        alert(
            "Please select Mobile Camera, Drone Camera or CCTV Camera first."
        );

        return;

    }


    const scanButton =
        document.getElementById("scanButton");

    const progressSection =
        document.getElementById("progressSection");

    const scanResult =
        document.getElementById("scanResult");

    const resultMessage =
        document.getElementById("resultMessage");


    // Disable button
    if (scanButton) {

        scanButton.disabled = true;

        scanButton.innerHTML =
            "🤖 AI SCANNING...";

    }


    if (progressSection) {

        progressSection.style.display =
            "block";

    }

    if (scanResult) {

        scanResult.style.display =
            "none";

    }


    // ==========================================
    // SIMULATED AI SCAN
    // ==========================================

    updateProgress(
        10,
        "Connecting to AI vision system..."
    );

    await wait(700);


    updateProgress(
        25,
        "Detecting workers..."
    );

    await wait(800);


    updateProgress(
        45,
        "Analyzing PPE equipment..."
    );

    await wait(900);


    updateProgress(
        65,
        "Checking safety violations..."
    );

    await wait(800);


    updateProgress(
        82,
        "Generating worker safety report..."
    );

    await wait(700);


    updateProgress(
        100,
        "Scan completed successfully!"
    );


    // ==========================================
    // DEMO RESULT
    // ==========================================

    const result = {

        workers_detected: 47,

        safe_workers: 42,

        violations: 5,

        overall_compliance: 89,

        ppe: {

            helmet: 89,

            vest: 94,

            harness: 81,

            boots: 96

        },

        workers: [

            {
                id: "W-001",
                status: "SAFE",
                violation: "None"
            },

            {
                id: "W-002",
                status: "WARNING",
                violation: "No Helmet"
            },

            {
                id: "W-003",
                status: "CRITICAL",
                violation: "No Harness"
            },

            {
                id: "W-004",
                status: "SAFE",
                violation: "None"
            },

            {
                id: "W-005",
                status: "WARNING",
                violation: "No Safety Vest"
            }

        ],

        source: selectedSource,

        scan_time:
            new Date().toLocaleString()

    };


    // Save result
    localStorage.setItem(
        "siteguardResult",
        JSON.stringify(result)
    );


    // Mark scan completed
    localStorage.setItem(
        "siteguardScanComplete",
        "true"
    );


    // ==========================================
    // SHOW RESULT
    // ==========================================

    if (scanResult) {

        scanResult.style.display =
            "block";

    }


    if (resultMessage) {

        resultMessage.innerHTML =

            "Workers Detected: <strong>47</strong><br>" +

            "Safe Workers: <strong>42</strong><br>" +

            "Safety Violations: <strong>5</strong><br>" +

            "Overall PPE Compliance: <strong>89%</strong>";

    }


    // ==========================================
    // UNLOCK DASHBOARD
    // ==========================================

    const dashboardButton =
        document.getElementById(
            "dashboardButton"
        );

    if (dashboardButton) {

        dashboardButton.classList.remove(
            "disabled"
        );

        dashboardButton.href =
            "dashboard.html";

        dashboardButton.setAttribute(
            "aria-disabled",
            "false"
        );

    }


    // Restore button
    if (scanButton) {

        scanButton.disabled = false;

        scanButton.innerHTML =
            "🔄 SCAN AGAIN";

    }

}


// =====================================================
// PROGRESS BAR
// =====================================================

function updateProgress(
    percent,
    message
) {

    const progressFill =
        document.getElementById(
            "progressFill"
        );

    const progressPercent =
        document.getElementById(
            "progressPercent"
        );

    const progressMessage =
        document.getElementById(
            "progressMessage"
        );


    if (progressFill) {

        progressFill.style.width =
            percent + "%";

    }

    if (progressPercent) {

        progressPercent.textContent =
            percent + "%";

    }

    if (progressMessage) {

        progressMessage.textContent =
            message;

    }

}


// =====================================================
// WAIT FUNCTION
// =====================================================

function wait(milliseconds) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


// =====================================================
// DASHBOARD
// =====================================================

function loadDashboard() {

    // Don't allow dashboard before scan
    const scanComplete =
        localStorage.getItem(
            "siteguardScanComplete"
        );

    if (scanComplete !== "true") {

        window.location.href =
            "scanning.html";

        return;

    }


    const savedResult =
        localStorage.getItem(
            "siteguardResult"
        );

    if (!savedResult) {

        window.location.href =
            "scanning.html";

        return;

    }


    const result =
        JSON.parse(savedResult);


    // ==========================================
    // WORKER COUNTS
    // ==========================================

    setText(
        "workersDetected",
        result.workers_detected
    );

    setText(
        "safeWorkers",
        result.safe_workers
    );

    setText(
        "violations",
        result.violations
    );

    setText(
        "overallCompliance",
        result.overall_compliance + "%"
    );


    // ==========================================
    // PPE
    // ==========================================

    setPPE(
        "helmet",
        result.ppe.helmet
    );

    setPPE(
        "vest",
        result.ppe.vest
    );

    setPPE(
        "harness",
        result.ppe.harness
    );

    setPPE(
        "boots",
        result.ppe.boots
    );


    // ==========================================
    // WORKERS
    // ==========================================

    renderWorkers(
        result.workers
    );


    // Source
    setText(
        "scanSource",
        result.source
    );

    setText(
        "scanTime",
        result.scan_time
    );

}


// =====================================================
// SET TEXT
// =====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


// =====================================================
// SET PPE PROGRESS
// =====================================================

function setPPE(
    name,
    percentage
) {

    const bar =
        document.getElementById(
            name + "Bar"
        );

    const value =
        document.getElementById(
            name + "Value"
        );


    if (bar) {

        bar.style.width =
            percentage + "%";

    }

    if (value) {

        value.textContent =
            percentage + "%";

    }

}


// =====================================================
// RENDER WORKERS
// =====================================================

function renderWorkers(
    workers
) {

    const table =
        document.getElementById(
            "workersTable"
        );

    if (!table) {
        return;
    }


    table.innerHTML = "";


    workers.forEach(
        function (worker) {

            const row =
                document.createElement(
                    "tr"
                );


            let statusClass =
                worker.status
                    .toLowerCase();


            row.innerHTML = `

                <td>
                    <strong>
                        ${worker.id}
                    </strong>
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${worker.status}
                    </span>
                </td>

                <td>
                    ${worker.violation}
                </td>

            `;


            table.appendChild(row);

        }
    );

}


// =====================================================
// EMERGENCY PAGE
// =====================================================

function initializeEmergency() {

    console.log(
        "Emergency system ready"
    );

}


// =====================================================
// DEMO EMERGENCY
// =====================================================

function testEmergency() {

    const emergencyBox =
        document.getElementById(
            "emergencyStatus"
        );

    if (!emergencyBox) {
        return;
    }


    emergencyBox.style.display =
        "block";


    emergencyBox.innerHTML = `

        <div class="emergency-active">

            <div class="emergency-icon">
                🚨
            </div>

            <h2>
                FIRE EMERGENCY DETECTED
            </h2>

            <p>
                AI has detected a possible
                fire hazard at the construction site.
            </p>

            <div class="emergency-flow">

                <div>
                    🤖
                    <strong>
                        AI Detection
                    </strong>
                </div>

                <div>
                    🔊
                    <strong>
                        60 Second Siren
                    </strong>
                </div>

                <div>
                    📱
                    <strong>
                        Manager Alert
                    </strong>
                </div>

                <div>
                    🚑
                    <strong>
                        Escalation
                    </strong>
                </div>

            </div>

            <button
                class="btn primary"
                onclick="resolveEmergency()">

                ACKNOWLEDGE EMERGENCY

            </button>

        </div>

    `;

}


// =====================================================
// RESOLVE EMERGENCY
// =====================================================

function resolveEmergency() {

    const emergencyBox =
        document.getElementById(
            "emergencyStatus"
        );

    if (!emergencyBox) {
        return;
    }


    emergencyBox.innerHTML = `

        <div class="emergency-resolved">

            <div class="result-icon">
                ✓
            </div>

            <h2>
                EMERGENCY ACKNOWLEDGED
            </h2>

            <p>
                Site manager has acknowledged
                the emergency alert.
            </p>

        </div>

    `;

}


// =====================================================
// STOP CAMERA WHEN LEAVING PAGE
// =====================================================

window.addEventListener(
    "beforeunload",
    function () {

        stopCamera();

    }
);