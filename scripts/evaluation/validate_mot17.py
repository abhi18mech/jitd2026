
import csv
import configparser
import json
import math
from pathlib import Path
from collections import Counter


# MOT17 sequence location
SEQUENCE_DIR = Path(
    "datasets/MOT17/MOT17/train/MOT17-02-FRCNN"
)

GT_FILE = SEQUENCE_DIR / "gt" / "gt.txt"
SEQINFO_FILE = SEQUENCE_DIR / "seqinfo.ini"
IMAGE_DIR = SEQUENCE_DIR / "img1"


def validate_mot17():

    errors = []
    warnings = []

    # Check required files
    for file_path in [GT_FILE, SEQINFO_FILE]:

        if not file_path.exists():
            errors.append(f"Missing file: {file_path}")

    if not IMAGE_DIR.is_dir():
        errors.append(f"Missing image directory: {IMAGE_DIR}")

    if errors:
        return {"status": "FAILED", "errors": errors}

    # Read sequence information
    config = configparser.ConfigParser()
    config.read(SEQINFO_FILE)

    sequence = config["Sequence"]

    total_frames = int(sequence["seqLength"])
    width = int(sequence["imWidth"])
    height = int(sequence["imHeight"])
    fps = float(sequence["frameRate"])
    extension = sequence.get("imExt", ".jpg")

    print("\nARGUS-X MOT17 VALIDATION")
    print("-" * 40)

    print("Sequence:", sequence["name"])
    print("Frames expected:", total_frames)
    print("Resolution:", width, "x", height)
    print("Frame rate:", fps)

    # Validate image frames
    image_files = list(IMAGE_DIR.glob(f"*{extension}"))

    image_count = len(image_files)

    if image_count != total_frames:
        errors.append(
            f"Expected {total_frames} images, found {image_count}"
        )

    # Check expected frame filenames
    missing_frames = []

    for frame in range(1, total_frames + 1):

        filename = f"{frame:06d}{extension}"

        if not (IMAGE_DIR / filename).exists():
            missing_frames.append(frame)

    if missing_frames:
        errors.append(
            f"Missing image frames: {len(missing_frames)}"
        )

    # Read ground-truth annotations
    frame_counts = Counter()
    object_ids = set()

    annotation_count = 0
    malformed_rows = 0
    invalid_boxes = 0
    outside_boxes = 0

    with open(GT_FILE, "r", newline="") as file:

        reader = csv.reader(file)

        for line_number, row in enumerate(reader, start=1):

            if len(row) != 9:
                malformed_rows += 1
                continue

            try:
                frame = int(row[0])
                object_id = int(row[1])

                x = float(row[2])
                y = float(row[3])
                box_width = float(row[4])
                box_height = float(row[5])

                confidence = float(row[6])
                class_id = float(row[7])
                visibility = float(row[8])

                values = [
                    x, y, box_width, box_height,
                    confidence, class_id, visibility
                ]

                if not all(math.isfinite(v) for v in values):
                    malformed_rows += 1
                    continue

            except ValueError:
                malformed_rows += 1
                continue

            annotation_count += 1

            frame_counts[frame] += 1
            object_ids.add(object_id)

            if frame < 1 or frame > total_frames:
                errors.append(
                    f"Invalid frame number at line {line_number}"
                )

            if box_width <= 0 or box_height <= 0:
                invalid_boxes += 1

            if x < 0 or y < 0 or x + box_width > width + 1 or y + box_height > height + 1:
                outside_boxes += 1

            if visibility < 0 or visibility > 1:
                warnings.append(
                    f"Unusual visibility value at line {line_number}"
                )

    if malformed_rows:
        errors.append(
            f"Malformed annotation rows: {malformed_rows}"
        )

    if invalid_boxes:
        errors.append(
            f"Invalid bounding boxes: {invalid_boxes}"
        )

    if outside_boxes:
        warnings.append(
            f"Bounding boxes outside image boundaries: {outside_boxes}"
        )

    if annotation_count == 0:
        errors.append("No valid ground-truth annotations found")

    # Final summary
    result = {
        "sequence": sequence["name"],
        "status": "PASSED" if not errors else "FAILED",
        "expected_frames": total_frames,
        "actual_frames": image_count,
        "annotations": annotation_count,
        "unique_object_ids": len(object_ids),
        "frames_with_annotations": len(frame_counts),
        "malformed_rows": malformed_rows,
        "invalid_boxes": invalid_boxes,
        "outside_boxes": outside_boxes,
        "errors": errors,
        "warnings": warnings
    }

    print("\nVALIDATION RESULTS")
    print("-" * 40)

    for key, value in result.items():
        print(f"{key}: {value}")

    # Save report
    report_dir = Path("reports/evaluation_results")
    report_dir.mkdir(parents=True, exist_ok=True)

    report_path = report_dir / "mot17_annotation_validation.json"

    with open(report_path, "w") as report_file:
        json.dump(result, report_file, indent=4)

    print("\nReport saved:", report_path)

    return result


if __name__ == "__main__":

    result = validate_mot17()

    if result["status"] != "PASSED":
        raise SystemExit(1)

    print("\nMOT17 ANNOTATION VALIDATION PASSED")
