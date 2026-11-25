import time
from dataclasses import dataclass, field
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    from backend.app.supabase_repository import (
        register_identity,
        mark_identity_lost,
        recover_identity,
        update_identity_seen,
        expire_identity,
    )
except ImportError:
    register_identity = None
    mark_identity_lost = None
    recover_identity = None
    update_identity_seen = None
    expire_identity = None


def persist(function, *args):
    if function is None:
        return
    try:
        function(*args)
    except Exception as exc:
        print(f"DATABASE SYNC WARNING: {exc}")


@dataclass
class Identity:
    identity_id: int
    state: str = "ACTIVE"
    tracker_id: int = None
    last_seen: float = field(default_factory=time.time)
    observations: int = 0
    last_db_sync: float = 0.0


class IdentityLifecycleManager:

    def __init__(
        self,
        confirmation_frames=3,
        lost_timeout=60,
        max_missed_frames=10
    ):
        self.identities = {}
        self.tracker_to_identity = {}
        self.pending = {}
        self.missed_frames = {}

        self.next_identity_id = 1
        self.confirmation_frames = confirmation_frames
        self.lost_timeout = lost_timeout
        self.max_missed_frames = max_missed_frames

        self.db_sync_interval = 15

        print("ARGUS-X Identity Lifecycle Manager Initialized")

    def update_track(self, tracker_id):

        if tracker_id in self.tracker_to_identity:
            identity_id = self.tracker_to_identity[tracker_id]
            identity = self.identities[identity_id]

            now = time.time()
            identity.last_seen = now
            identity.observations += 1
            self.missed_frames[tracker_id] = 0

            if now - identity.last_db_sync >= self.db_sync_interval:
                persist(update_identity_seen, identity_id)
                identity.last_db_sync = now

            return identity_id

        pending = self.pending.setdefault(
            tracker_id, {"observations": 0}
        )

        pending["observations"] += 1

        if pending["observations"] < self.confirmation_frames:
            return None

        identity_id = self.next_identity_id
        self.next_identity_id += 1

        self.identities[identity_id] = Identity(
            identity_id=identity_id,
            tracker_id=tracker_id,
            observations=pending["observations"]
        )

        self.tracker_to_identity[tracker_id] = identity_id
        self.missed_frames[tracker_id] = 0
        del self.pending[tracker_id]

        print(f"NEW IDENTITY CONFIRMED: ARGUS-ID {identity_id}")
        persist(register_identity, identity_id, tracker_id)

        return identity_id

    def confirm_recovery(self, tracker_id, identity_id):

        identity = self.identities.get(identity_id)

        if identity is None or identity.state != "LOST":
            return False

        if identity_id in self.tracker_to_identity.values():
            return False

        now = time.time()

        identity.state = "ACTIVE"
        identity.tracker_id = tracker_id
        identity.last_seen = now
        identity.last_db_sync = now
        identity.observations += 1

        self.tracker_to_identity[tracker_id] = identity_id
        self.missed_frames[tracker_id] = 0
        self.pending.pop(tracker_id, None)

        print(f"IDENTITY RECOVERED: ARGUS-ID {identity_id}")
        persist(recover_identity, identity_id, tracker_id)

        return True

    def mark_missing_tracks(self, visible_tracker_ids):

        visible = set(visible_tracker_ids)

        for tracker_id, identity_id in list(
            self.tracker_to_identity.items()
        ):

            if tracker_id in visible:
                self.missed_frames[tracker_id] = 0
                continue

            self.missed_frames[tracker_id] = (
                self.missed_frames.get(tracker_id, 0) + 1
            )

            if self.missed_frames[tracker_id] >= self.max_missed_frames:

                identity = self.identities[identity_id]
                identity.state = "LOST"
                identity.tracker_id = None

                del self.tracker_to_identity[tracker_id]
                del self.missed_frames[tracker_id]

                print(f"IDENTITY LOST: ARGUS-ID {identity_id}")
                persist(mark_identity_lost, identity_id)

        for tracker_id in list(self.pending):
            if tracker_id not in visible:
                del self.pending[tracker_id]

    def expire_old_identities(self):

        now = time.time()

        for identity in self.identities.values():

            if identity.state == "LOST":
                if now - identity.last_seen > self.lost_timeout:
                    identity.state = "EXPIRED"

                    print(
                        f"IDENTITY EXPIRED: ARGUS-ID "
                        f"{identity.identity_id}"
                    )

                    persist(expire_identity, identity.identity_id)

    def get_statistics(self):

        stats = {
            "ACTIVE": 0,
            "LOST": 0,
            "EXPIRED": 0,
            "PENDING": len(self.pending)
        }

        for identity in self.identities.values():
            stats[identity.state] += 1

        return stats


if __name__ == "__main__":

    manager = IdentityLifecycleManager(
        confirmation_frames=3,
        max_missed_frames=2
    )

    manager.update_track(101)
    manager.update_track(101)
    identity_id = manager.update_track(101)

    assert identity_id == 1

    manager.mark_missing_tracks([])
    manager.mark_missing_tracks([])

    assert manager.identities[1].state == "LOST"
    assert manager.confirm_recovery(202, 1)

    print("Statistics:", manager.get_statistics())
    print("IDENTITY LIFECYCLE TEST PASSED")
