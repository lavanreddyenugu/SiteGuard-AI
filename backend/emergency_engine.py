import uuid
import time
import threading


class EmergencyEngine:

    def __init__(self):
        self.incidents = {}

    def create_incident(self, emergency_type="FIRE"):

        incident_id = str(uuid.uuid4())

        incident = {
            "id": incident_id,
            "type": emergency_type,
            "status": "DETECTED",
            "siren": "ACTIVE",
            "manager_alert": "SENT",
            "created_at": time.time()
        }

        self.incidents[incident_id] = incident

        thread = threading.Thread(
            target=self.watch_incident,
            args=(incident_id,),
            daemon=True
        )

        thread.start()

        return incident

    def watch_incident(self, incident_id):

        time.sleep(60)

        incident = self.incidents.get(incident_id)

        if not incident:
            return

        if incident["status"] == "DETECTED":

            incident["status"] = "ESCALATION_REQUIRED"

            incident["siren"] = "STOPPED_AFTER_60_SECONDS"

    def acknowledge(self, incident_id):

        incident = self.incidents.get(incident_id)

        if not incident:
            return None

        incident["status"] = "ACKNOWLEDGED"
        incident["siren"] = "STOPPED"

        return incident

    def resolve(self, incident_id):

        incident = self.incidents.get(incident_id)

        if not incident:
            return None

        incident["status"] = "RESOLVED"
        incident["siren"] = "STOPPED"

        return incident

    def get_status(self, incident_id):

        return self.incidents.get(incident_id)