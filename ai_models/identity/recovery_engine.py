import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import cv2
import torch

from ultralytics import YOLO
from ai_models.reid.feature_extractor import ReIDFeatureExtractor
from ai_models.identity.memory_gallery import IdentityMemory
from ai_models.identity.global_association import GlobalIdentityAssociation
from ai_models.identity.identity_lifecycle import IdentityLifecycleManager
from ai_models.identity.pending_association import PendingIdentityAssociation


class IdentityRecoveryEngine:

    def __init__(self, model_name="yolo11n.pt"):

        self.device = 0 if torch.cuda.is_available() else "cpu"

        print("=" * 55)
        print("ARGUS-X IDENTITY RECOVERY ENGINE")
        print("=" * 55)

        print(
            "GPU:",
            torch.cuda.get_device_name(0)
            if self.device == 0 else "CPU"
        )

        self.detector_tracker = YOLO(model_name)
        self.extractor = ReIDFeatureExtractor()

        self.memory = IdentityMemory(
            similarity_threshold=0.80,
            ambiguity_margin=0.08
        )

        self.associator = GlobalIdentityAssociation(
            similarity_threshold=0.80,
            ambiguity_margin=0.08
        )

        self.lifecycle = IdentityLifecycleManager(
            confirmation_frames=3,
            max_missed_frames=30,
            lost_timeout=60
        )

        self.pending_association = PendingIdentityAssociation(
            confirmation_frames=3,
            similarity_threshold=0.80,
            max_frame_gap=5
        )

        self.frame_number = 0
        self.confidence = 0.45

        print("ARGUS-X Integration Ready")

    def process_frame(self, frame):

        self.frame_number += 1

        expired_candidates = self.pending_association.expire(
            self.frame_number
        )

        for tracker_id in expired_candidates:
            print(
                f"RECOVERY CANDIDATE EXPIRED | Tracker {tracker_id}"
            )

        results = self.detector_tracker.track(
            source=frame,
            tracker=str(PROJECT_ROOT / "ai_models" / "tracking" / "argus_botsort.yaml"),
            persist=True,
            conf=self.confidence,
            device=self.device,
            verbose=False
        )

        result = results[0]
        output = frame.copy()

        if result.boxes is None or result.boxes.id is None:

            self.lifecycle.mark_missing_tracks([])
            self.lifecycle.expire_old_identities()

            return output

        boxes = result.boxes

        # Process pedestrian detections only (COCO class 0).
        class_ids = boxes.cls.int().cpu().numpy()
        person_mask = class_ids == 0

        coordinates = boxes.xyxy.int().cpu().numpy()[person_mask]
        tracker_ids = boxes.id.int().cpu().numpy()[person_mask].tolist()
        confidences = boxes.conf.cpu().numpy()[person_mask].tolist()

        visible_tracker_ids = set(tracker_ids)

        self.lifecycle.mark_missing_tracks(visible_tracker_ids)

        observations = {}

        for box, track_id, confidence in zip(
            coordinates, tracker_ids, confidences
        ):

            x1, y1, x2, y2 = box

            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(frame.shape[1], x2)
            y2 = min(frame.shape[0], y2)

            if x2 <= x1 or y2 <= y1:
                continue

            crop = frame[y1:y2, x1:x2]

            if crop.size == 0:
                continue

            feature = self.extractor.extract(crop)

            if feature is None:
                continue

            observations[track_id] = {
                "box": (x1, y1, x2, y2),
                "feature": feature,
                "confidence": confidence
            }

        # Update already registered tracker identities.
        for track_id in observations:

            if track_id in self.lifecycle.tracker_to_identity:
                self.lifecycle.update_track(track_id)

        # Collect newly detected tracker IDs.
        new_tracks = {
            track_id: data["feature"]
            for track_id, data in observations.items()
            if track_id not in self.lifecycle.tracker_to_identity
        }

        # Only LOST identities are eligible for recovery.
        lost_gallery = {
            identity_id: self.memory.gallery[identity_id]
            for identity_id, identity in self.lifecycle.identities.items()
            if identity.state == "LOST"
            and identity_id in self.memory.gallery
        }

        active_ids = set(
            self.lifecycle.tracker_to_identity.values()
        )

        assignments, unmatched = self.associator.associate(
            new_tracks,
            lost_gallery,
            active_identity_ids=active_ids,
            reserved_identity_owners=self.pending_association.reservations
        )

        # Verify recovery candidates across multiple observations.
        for track_id, match in assignments.items():

            identity_id = match["identity_id"]

            confirmation = self.pending_association.update(
                tracker_id=track_id,
                candidate_identity=identity_id,
                similarity=match["similarity"],
                frame_number=self.frame_number,
                second_similarity=match.get("second_similarity", -1.0)
            )

            if confirmation is None:
                print(
                    f"RECOVERY CANDIDATE | Tracker {track_id} | "
                    f"ARGUS-ID {identity_id} | "
                    f"Similarity {match['similarity']}"
                )
                continue

            recovered = self.lifecycle.confirm_recovery(
                track_id,
                confirmation["identity_id"]
            )

            if recovered:
                print(
                    f"RECOVERY VERIFIED | Tracker {track_id} | "
                    f"ARGUS-ID {identity_id} | "
                    f"Observations {confirmation['observations']}"
                )
            else:
                self.pending_association.remove(track_id)
                print(
                    f"RECOVERY CONFIRMATION REJECTED | "
                    f"Tracker {track_id} | ARGUS-ID {identity_id}"
                )

        # Preserve trackers with an active recovery candidate.
        # Do not prematurely register them as new identities.
        for track_id in unmatched:

            if track_id in self.pending_association.pending:
                print(
                    f"RECOVERY WAITING | Tracker {track_id} | "
                    f"Pending verification"
                )
                continue

            identity_id = self.lifecycle.update_track(track_id)

            if identity_id is not None:
                print(
                    f"NEW IDENTITY REGISTERED | "
                    f"ARGUS-ID {identity_id}"
                )

        # Update gallery only for confirmed identities.
        for track_id, data in observations.items():

            identity_id = self.lifecycle.tracker_to_identity.get(
                track_id
            )

            if identity_id is None:
                continue

            self.memory.add(
                identity_id,
                data["feature"],
                quality=data["confidence"]
            )

            x1, y1, x2, y2 = data["box"]

            state = self.lifecycle.identities[identity_id].state

            label = f"ARGUS-ID {identity_id} | {state}"

            cv2.rectangle(
                output,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            cv2.putText(
                output,
                label,
                (x1, max(25, y1 - 10)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (0, 255, 0),
                2
            )

        self.lifecycle.expire_old_identities()

        return output

    def run(self, source=0):

        cap = cv2.VideoCapture(source)

        if not cap.isOpened():
            raise RuntimeError("Unable to open camera")

        print("Camera started. Press Q to quit.")

        try:
            while True:

                success, frame = cap.read()

                if not success:
                    break

                output = self.process_frame(frame)

                cv2.imshow(
                    "ARGUS-X Identity Recovery",
                    output
                )

                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

        finally:
            print("Final identity statistics:")
            print(self.lifecycle.get_statistics())

            cap.release()
            cv2.destroyAllWindows()


if __name__ == "__main__":

    engine = IdentityRecoveryEngine()
    engine.run(source=0)




