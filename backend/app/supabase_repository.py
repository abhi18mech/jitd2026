from datetime import datetime, timezone
from threading import Lock

from backend.app.supabase_client import get_supabase


CAMERA_ID = "CAM-01"

_active_session_id = None
_session_lock = Lock()


def _now():
    return datetime.now(timezone.utc).isoformat()


def _get_active_session():
    with _session_lock:
        return _active_session_id


def _record_event(identity_uuid, event_type, tracker_id=None):
    try:
        payload = {
            "identity_id": identity_uuid,
            "session_id": _get_active_session(),
            "event_type": event_type,
            "camera_id": CAMERA_ID,
            "event_data": {}
        }

        if tracker_id is not None:
            payload["event_data"]["tracker_id"] = tracker_id

        get_supabase().table("tracking_events").insert(payload).execute()

    except Exception as exc:
        print(f"SUPABASE EVENT ERROR: {exc}")


def register_identity(identity_id, tracker_id):
    try:
        client = get_supabase()
        argus_id = f"ARGUS-ID {identity_id}"

        response = client.table("identity_records").upsert({
            "argus_id": argus_id,
            "status": "ACTIVE",
            "camera_id": CAMERA_ID,
            "last_seen": _now()
        }, on_conflict="argus_id").execute()

        if not response.data:
            return None

        record = response.data[0]
        _record_event(record["id"], "IDENTITY_REGISTERED", tracker_id)

        print(f"SUPABASE: Registered {argus_id}")
        return record["id"]

    except Exception as exc:
        print(f"SUPABASE REGISTRATION ERROR: {exc}")
        return None


def update_identity_seen(identity_id):
    try:
        get_supabase().table("identity_records").update({
            "last_seen": _now()
        }).eq("argus_id", f"ARGUS-ID {identity_id}").execute()

    except Exception as exc:
        print(f"SUPABASE LAST SEEN ERROR: {exc}")


def mark_identity_lost(identity_id):
    try:
        client = get_supabase()
        argus_id = f"ARGUS-ID {identity_id}"

        response = client.table("identity_records").update({
            "status": "LOST"
        }).eq("argus_id", argus_id).execute()

        if response.data:
            _record_event(response.data[0]["id"], "IDENTITY_LOST")
            print(f"SUPABASE: {argus_id} marked LOST")
            return True

    except Exception as exc:
        print(f"SUPABASE LOST ERROR: {exc}")

    return False


def recover_identity(identity_id, tracker_id):
    try:
        client = get_supabase()
        argus_id = f"ARGUS-ID {identity_id}"

        response = client.table("identity_records").update({
            "status": "ACTIVE",
            "camera_id": CAMERA_ID,
            "last_seen": _now()
        }).eq("argus_id", argus_id).execute()

        if not response.data:
            return False

        identity_uuid = response.data[0]["id"]

        client.table("recovery_events").insert({
            "identity_id": identity_uuid,
            "session_id": _get_active_session(),
            "previous_camera": CAMERA_ID,
            "recovered_camera": CAMERA_ID,
            "recovery_status": "RECOVERED"
        }).execute()

        _record_event(identity_uuid, "IDENTITY_RECOVERED", tracker_id)

        print(f"SUPABASE: {argus_id} recovery saved")
        return True

    except Exception as exc:
        print(f"SUPABASE RECOVERY ERROR: {exc}")

    return False


def expire_identity(identity_id):
    try:
        client = get_supabase()
        argus_id = f"ARGUS-ID {identity_id}"

        response = client.table("identity_records").update({
            "status": "EXPIRED"
        }).eq("argus_id", argus_id).execute()

        if response.data:
            _record_event(response.data[0]["id"], "IDENTITY_EXPIRED")
            print(f"SUPABASE: {argus_id} marked EXPIRED")
            return True

    except Exception as exc:
        print(f"SUPABASE EXPIRATION ERROR: {exc}")

    return False


def start_monitoring_session(camera_id=CAMERA_ID):
    global _active_session_id

    try:
        response = get_supabase().table("monitoring_sessions").insert({
            "camera_id": camera_id,
            "status": "active"
        }).execute()

        if response.data:
            session_id = response.data[0]["id"]

            with _session_lock:
                _active_session_id = session_id

            print(f"SUPABASE: Monitoring session started {session_id}")
            return session_id

    except Exception as exc:
        print(f"SUPABASE SESSION START ERROR: {exc}")

    return None


def end_monitoring_session(session_id):
    global _active_session_id

    if not session_id:
        return

    try:
        get_supabase().table("monitoring_sessions").update({
            "status": "stopped",
            "ended_at": _now()
        }).eq("id", session_id).execute()

        print("SUPABASE: Monitoring session stopped")

    except Exception as exc:
        print(f"SUPABASE SESSION STOP ERROR: {exc}")

    finally:
        with _session_lock:
            if _active_session_id == session_id:
                _active_session_id = None
