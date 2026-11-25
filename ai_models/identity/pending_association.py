class PendingIdentityAssociation:

    def __init__(
        self,
        confirmation_frames=3,
        similarity_threshold=0.80,
        ambiguity_margin=0.08,
        max_frame_gap=5
    ):
        self.confirmation_frames = confirmation_frames
        self.similarity_threshold = similarity_threshold
        self.ambiguity_margin = ambiguity_margin
        self.max_frame_gap = max_frame_gap

        self.pending = {}
        self.reservations = {}

        print("ARGUS-X Pending Identity Association Initialized")

    def update(
        self,
        tracker_id,
        candidate_identity,
        similarity,
        frame_number,
        second_similarity=-1.0
    ):

        if similarity < self.similarity_threshold:
            return None

        candidate = self.pending.get(tracker_id)

        if candidate is not None:
            gap = frame_number - candidate["last_frame"]

            if gap <= 0:
                return None

            if (
                candidate["identity_id"] != candidate_identity
                or gap > self.max_frame_gap
            ):
                self.remove(tracker_id)
                candidate = None

        owner = self.reservations.get(candidate_identity)

        if owner is not None and owner != tracker_id:
            return None

        if candidate is None:
            candidate = {
                "identity_id": candidate_identity,
                "observations": 0,
                "confirmed_observations": 0,
                "last_frame": frame_number
            }

            self.pending[tracker_id] = candidate
            self.reservations[candidate_identity] = tracker_id

        candidate["observations"] += 1
        candidate["last_frame"] = frame_number

        margin = similarity - second_similarity
        unambiguous = margin >= self.ambiguity_margin

        if unambiguous:
            candidate["confirmed_observations"] += 1
        else:
            print(
                f"AMBIGUITY WAIT | Tracker {tracker_id} | "
                f"Identity {candidate_identity} | "
                f"Margin {margin:.4f}"
            )
            return None

        if candidate["confirmed_observations"] >= self.confirmation_frames:

            confirmed_id = candidate["identity_id"]
            observations = candidate["observations"]

            self.remove(tracker_id)

            return {
                "identity_id": confirmed_id,
                "status": "CONFIRMED",
                "observations": observations
            }

        return None

    def expire(self, frame_number):

        expired = [
            tracker_id
            for tracker_id, candidate in self.pending.items()
            if frame_number - candidate["last_frame"] > self.max_frame_gap
        ]

        for tracker_id in expired:
            self.remove(tracker_id)

        return expired

    def remove(self, tracker_id):

        candidate = self.pending.pop(tracker_id, None)

        if candidate is not None:
            identity_id = candidate["identity_id"]

            if self.reservations.get(identity_id) == tracker_id:
                self.reservations.pop(identity_id, None)

    def is_reserved(self, identity_id):
        return identity_id in self.reservations

    def get_pending_count(self):
        return len(self.pending)


if __name__ == "__main__":

    manager = PendingIdentityAssociation()

    print("\nTEST 1: Ambiguous matches must not confirm")

    assert manager.update(101, 1, 0.94, 1, 0.92) is None
    assert manager.update(101, 1, 0.95, 2, 0.93) is None
    assert manager.update(101, 1, 0.96, 3, 0.94) is None

    assert manager.get_pending_count() == 1

    print("PASS: Ambiguous matches remain pending")

    print("\nTEST 2: Three clear observations confirm")

    assert manager.update(101, 1, 0.94, 4, 0.80) is None
    assert manager.update(101, 1, 0.93, 5, 0.80) is None

    result = manager.update(101, 1, 0.95, 6, 0.80)

    assert result is not None
    assert result["identity_id"] == 1
    assert result["status"] == "CONFIRMED"

    print("PASS:", result)

    print("\nTEST 3: Weak matches do not confirm")

    assert manager.update(102, 2, 0.50, 7, 0.10) is None

    print("PASS: Weak match rejected")

    print("\nALL PENDING ASSOCIATION TESTS PASSED")
