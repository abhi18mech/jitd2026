import numpy as np
import torch
import supervision as sv
from reid import ReIDModel


class ReIDFeatureExtractor:

    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        print("Initializing ARGUS-X OSNet Re-ID Extractor")
        print("Device:", self.device)

        self.model = ReIDModel.from_pretrained(
            "osnet_x1_0_msmt17_combineall",
            device=self.device
        )

        print("OSNet model loaded successfully")

    def extract(self, image_crop):

        if image_crop is None:
            return None

        if not isinstance(image_crop, np.ndarray):
            return None

        if image_crop.size == 0:
            return None

        if image_crop.ndim != 3 or image_crop.shape[2] != 3:
            return None

        height, width = image_crop.shape[:2]

        if height < 32 or width < 16:
            return None

        detections = sv.Detections(
            xyxy=np.array(
                [[0, 0, width, height]],
                dtype=np.float32
            )
        )

        embeddings = self.model.extract_embeddings(
            detections,
            image_crop
        )

        if embeddings.shape != (1, 512):
            raise ValueError(
                f"Unexpected OSNet embedding shape: {embeddings.shape}"
            )

        features = embeddings[0].astype(np.float32)

        norm = np.linalg.norm(features)

        if not np.isfinite(norm) or norm < 1e-12:
            return None

        features = features / norm

        return features


if __name__ == "__main__":

    extractor = ReIDFeatureExtractor()

    test_image = np.random.randint(
        0, 256, (256, 128, 3), dtype=np.uint8
    )

    features = extractor.extract(test_image)

    assert features is not None
    assert features.shape == (512,)
    assert np.isfinite(features).all()
    assert abs(np.linalg.norm(features) - 1.0) < 1e-5

    print("Feature dimensions:", features.shape)
    print("Feature norm:", np.linalg.norm(features))
    print("OSNet feature extraction successful!")
