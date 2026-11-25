import torch
from ultralytics import YOLO


class ARGUSTracker:

    def __init__(self, model_name="yolo11n.pt"):

        self.device = 0 if torch.cuda.is_available() else "cpu"

        print("=" * 45)
        print("ARGUS-X MULTI-OBJECT TRACKING ENGINE")
        print("=" * 45)

        print(
            "GPU:",
            torch.cuda.get_device_name(0)
            if self.device == 0 else "CPU"
        )

        self.model = YOLO(model_name)

    def track(self, source=0):

        results = self.model.track(
            source=source,
            tracker="botsort.yaml",
            persist=True,
            stream=True,
            show=True,
            conf=0.35,
            device=self.device,
            verbose=False
        )

        for result in results:

            if result.boxes is None:
                continue

            boxes = result.boxes

            if boxes.id is None:
                continue

            track_ids = boxes.id.int().cpu().tolist()
            classes = boxes.cls.int().cpu().tolist()
            confidences = boxes.conf.cpu().tolist()

            for track_id, class_id, confidence in zip(
                track_ids, classes, confidences
            ):

                class_name = self.model.names[class_id]

                print(
                    f"Frame: {result.path} | "
                    f"ID: {track_id} | "
                    f"Object: {class_name} | "
                    f"Confidence: {confidence:.2f}"
                )


if __name__ == "__main__":

    tracker = ARGUSTracker()
    tracker.track(source=0)
