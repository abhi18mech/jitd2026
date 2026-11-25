import numpy as np
import torch
import supervision as sv
from reid import ReIDModel

print("Loading pretrained OSNet...")

model = ReIDModel.from_pretrained(
    "osnet_x1_0_msmt17_combineall",
    device="cuda"
)

frame = np.zeros((256, 128, 3), dtype=np.uint8)

detections = sv.Detections(
    xyxy=np.array([[0, 0, 128, 256]], dtype=np.float32)
)

embeddings = model.extract_embeddings(detections, frame)

print("GPU:", torch.cuda.get_device_name(0))
print("Embedding shape:", embeddings.shape)
print("OSNet device:", model.device)

assert embeddings.shape == (1, 512)
assert np.isfinite(embeddings).all()

print("OSNET TEST PASSED")
