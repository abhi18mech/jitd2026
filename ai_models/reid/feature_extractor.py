import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import numpy as np


class ReIDFeatureExtractor:

    def __init__(self):
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        print("Initializing ARGUS-X Re-ID Feature Extractor")
        print("Device:", self.device)

        weights = models.ResNet50_Weights.DEFAULT
        model = models.resnet50(weights=weights)

        self.model = nn.Sequential(
            *list(model.children())[:-1]
        ).to(self.device)

        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((256, 128)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def extract(self, image_crop):
        if image_crop is None or image_crop.size == 0:
            return None

        image = Image.fromarray(
            image_crop[:, :, ::-1]
        ).convert("RGB")

        tensor = self.transform(image).unsqueeze(0)
        tensor = tensor.to(self.device)

        with torch.no_grad():
            features = self.model(tensor)
            features = features.flatten(1)
            features = F.normalize(features, p=2, dim=1)

        return features.squeeze(0).cpu().numpy()


if __name__ == "__main__":
    extractor = ReIDFeatureExtractor()

    test_image = np.zeros((256, 128, 3), dtype=np.uint8)
    features = extractor.extract(test_image)

    print("Feature dimensions:", features.shape)
    print("Feature extraction successful!")
