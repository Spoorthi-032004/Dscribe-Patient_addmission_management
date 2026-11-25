"""Unit and integration tests for Patient Admission Management API."""

import os
import sys
import tempfile
import unittest
from datetime import timedelta
from pathlib import Path

from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Configure an isolated temporary SQLite database before importing app modules
_TEMP_DIR = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
_TEST_DB_PATH = Path(_TEMP_DIR.name) / "test_patients.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH.as_posix()}"

from app.database import current_ist_date, init_db  # noqa: E402
from app.main import app  # noqa: E402


class PatientApiTests(unittest.TestCase):
    """Covers CRUD, search, filters, discharge, persistence, and backend validation."""

    @classmethod
    def setUpClass(cls):
        init_db(seed_demo_data=False)
        cls.client = TestClient(app)

    def _valid_payload(self, **overrides):
        base = {
            "name": "Neha Kapoor",
            "age": 29,
            "gender": "Female",
            "ward": "General Ward",
            "department": "Cardiology",
            "doctor": "Dr. Ananya Sharma",
            "admission_date": current_ist_date().isoformat(),
            "status": "Admitted",
        }
        base.update(overrides)
        return base

    def test_01_create_list_edit_discharge_delete_patient(self):
        # Create
        res = self.client.post("/api/patients", json=self._valid_payload())
        self.assertEqual(res.status_code, 201, res.text)
        created = res.json()
        patient_id = created["id"]
        self.assertEqual(created["name"], "Neha Kapoor")
        self.assertEqual(created["status"], "Admitted")

        # List
        list_res = self.client.get("/api/patients")
        self.assertEqual(list_res.status_code, 200)
        self.assertTrue(any(p["id"] == patient_id for p in list_res.json()))

        # Edit
        update_payload = self._valid_payload(name="Neha Verma", age=30, ward="ICU")
        edit_res = self.client.put(f"/api/patients/{patient_id}", json=update_payload)
        self.assertEqual(edit_res.status_code, 200, edit_res.text)
        self.assertEqual(edit_res.json()["name"], "Neha Verma")
        self.assertEqual(edit_res.json()["ward"], "ICU")

        # Discharge
        dis_res = self.client.patch(f"/api/patients/{patient_id}/discharge")
        self.assertEqual(dis_res.status_code, 200, dis_res.text)
        self.assertEqual(dis_res.json()["status"], "Discharged")

        # Discharging again fails cleanly
        dis_again = self.client.patch(f"/api/patients/{patient_id}/discharge")
        self.assertEqual(dis_again.status_code, 400)

        # Delete
        del_res = self.client.delete(f"/api/patients/{patient_id}")
        self.assertEqual(del_res.status_code, 200)
        get_deleted = self.client.get(f"/api/patients/{patient_id}")
        self.assertEqual(get_deleted.status_code, 404)

    def test_02_search_and_filters(self):
        p1 = self.client.post(
            "/api/patients",
            json=self._valid_payload(
                name="Siddharth Bose",
                ward="ICU",
                department="Neurology",
                doctor="Dr. Rajesh Verma",
            ),
        ).json()
        p2 = self.client.post(
            "/api/patients",
            json=self._valid_payload(
                name="Aditi Rao",
                ward="Pediatric Ward",
                department="Pediatrics",
                doctor="Dr. Priya Nair",
            ),
        ).json()

        # Search by name
        search_res = self.client.get("/api/patients", params={"search": "siddharth"})
        self.assertEqual(search_res.status_code, 200)
        names = [p["name"] for p in search_res.json()]
        self.assertIn("Siddharth Bose", names)
        self.assertNotIn("Aditi Rao", names)

        # Filter by Ward + Department + Doctor
        filter_res = self.client.get(
            "/api/patients",
            params={
                "ward": "Pediatric Ward",
                "department": "Pediatrics",
                "doctor": "Dr. Priya Nair",
            },
        )
        self.assertEqual(filter_res.status_code, 200)
        filtered_names = [p["name"] for p in filter_res.json()]
        self.assertEqual(filtered_names, ["Aditi Rao"])

        # Cleanup
        self.client.delete(f"/api/patients/{p1['id']}")
        self.client.delete(f"/api/patients/{p2['id']}")

    def test_03_backend_validation_rejects_invalid_data(self):
        # Name with numbers
        r1 = self.client.post("/api/patients", json=self._valid_payload(name="John123"))
        self.assertEqual(r1.status_code, 422)
        self.assertIn("name", r1.json()["errors"])

        # Empty name
        r2 = self.client.post("/api/patients", json=self._valid_payload(name="   "))
        self.assertEqual(r2.status_code, 422)
        self.assertIn("name", r2.json()["errors"])

        # Age out of range
        r3 = self.client.post("/api/patients", json=self._valid_payload(age=121))
        self.assertEqual(r3.status_code, 422)
        self.assertIn("age", r3.json()["errors"])

        r4 = self.client.post("/api/patients", json=self._valid_payload(age=-1))
        self.assertEqual(r4.status_code, 422)
        self.assertIn("age", r4.json()["errors"])

        # Age = 0 is valid (newborn)
        r_zero = self.client.post("/api/patients", json=self._valid_payload(age=0))
        self.assertEqual(r_zero.status_code, 201, r_zero.text)
        self.client.delete(f"/api/patients/{r_zero.json()['id']}")

        # Invalid dropdown choices
        r5 = self.client.post(
            "/api/patients",
            json=self._valid_payload(
                gender="Unknown",
                ward="Secret Ward",
                department="Astrology",
                doctor="Dr. Fake",
            ),
        )
        self.assertEqual(r5.status_code, 422)
        for field in ("gender", "ward", "department", "doctor"):
            self.assertIn(field, r5.json()["errors"])

        # Future admission date
        tomorrow = (current_ist_date() + timedelta(days=1)).isoformat()
        r6 = self.client.post(
            "/api/patients", json=self._valid_payload(admission_date=tomorrow)
        )
        self.assertEqual(r6.status_code, 422)
        self.assertIn("admission_date", r6.json()["errors"])


if __name__ == "__main__":
    unittest.main()
