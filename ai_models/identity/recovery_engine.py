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


class IdentityRecoveryEngine:

    def __init__(
        self,
        model_name="yolo11n.pt",
        confidence=0.35,
        similarity_threshold=0.85
    ):
        self.device = 0 if torch.cuda.is_available() else "cpu"

        print("=" * 55)
        print("ARGUS-X IDENTITY RECOVERY ENGINE")
        print("=" * 55)

        print(
            "Device:",
            torch.cuda.get_device_name(0)
            if self.device == 0 else "CPU"
        )

        self.detector_tracker = YOLO(model_name)
        self.extractor = ReIDFeatureExtractor()

        self.memory = IdentityMemory(
            similarity_threshold=similarity_threshold,
            ambiguity_margin=0.08
        )

        self.confidence = confidence
        self.track_to_identity = {}
        self.next_identity_id = 1

        print("Identity Recovery Engine Ready")

    def process_frame(self, frame):

        results = self.detector_tracker.track(
            source=frame,
            tracker="botsort.yaml",
            persist=True,
            conf=self.confidence,
            device=self.device,
            verbose=False
        )

        result = results[0]
        output = frame.copy()

        if result.boxes is None or result.boxes.id is None:
            return output

        boxes = result.boxes

        xyxy = boxes.xyxy.int().cpu().numpy()
        track_ids = boxes.id.int().cpu().tolist()
        confidences = boxes.conf.cpu().tolist()

        # Determine identities already assigned to visible tracks.
        current_track_ids = set(track_ids)

        active_identity_ids = {
            self.track_to_identity[track_id]
            for track_id in current_track_ids
            if track_id in self.track_to_identity
        }

        for box, track_id, confidence in zip(
            xyxy, track_ids, confidences
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

            if track_id in self.track_to_identity:

                identity_id = self.track_to_identity[track_id]

                self.memory.add(
                    identity_id,
                    feature,
                    quality=confidence
                )

                status = "TRACKED"

            else:

                match = self.memory.match(
                    feature,
                    exclude_ids=active_identity_ids
                )

                if match is not None:

                    identity_id = match["identity_id"]

                    self.track_to_identity[track_id] = identity_id

                    status = "RECOVERED"

                    print(
                        f"Recovered tracker {track_id} "
                        f"as identity {identity_id}"
                    )

                else:

                    identity_id = self.next_identity_id
                    self.next_identity_id += 1

                    self.track_to_identity[track_id] = identity_id

                    self.memory.add(
                        identity_id,
                        feature,
                        quality=confidence
                    )

                    status = "NEW"

                    print(
                        f"New tracker {track_id} "
                        f"registered as identity {identity_id}"
                    )

                active_identity_ids.add(identity_id)

            color = (0, 255, 0)

            label = (
                f"ARGUS-ID {identity_id} | "
                f"Tracker {track_id} | {status}"
            )

            cv2.rectangle(
                output,
                (x1, y1),
                (x2, y2),
                color,
                2
            )

            cv2.putText(
                output,
                label,
                (x1, max(25, y1 - 10)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                color,
                2
            )

        return output

    def run(self, source=0):

        cap = cv2.VideoCapture(source)

        if not cap.isOpened():
            raise RuntimeError("Unable to open video source")

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
            cap.release()
            cv2.destroyAllWindows()


if __name__ == "__main__":

    engine = IdentityRecoveryEngine()
    engine.run(source=0)
