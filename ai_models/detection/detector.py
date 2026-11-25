import torch
from ultralytics import YOLO


class ObjectDetector:

    def __init__(self, model_name="yolo11n.pt", confidence=0.35):
        self.device = 0 if torch.cuda.is_available() else "cpu"
        self.confidence = confidence

        print("Initializing ARGUS-X Object Detector")
        print("Device:", torch.cuda.get_device_name(0) if self.device == 0 else "CPU")

        self.model = YOLO(model_name)

    def detect(self, frame):
        results = self.model.predict(
            source=frame,
            device=self.device,
            conf=self.confidence,
            verbose=False
        )
        return results[0]

    def run_webcam(self, source=0):
        for result in self.model.predict(
            source=source,
            device=self.device,
            conf=self.confidence,
            stream=True,
            show=True,
            verbose=False
        ):
            pass


if __name__ == "__main__":
    detector = ObjectDetector()
    detector.run_webcam()
