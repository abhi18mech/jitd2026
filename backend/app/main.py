import threading
import time

import cv2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI(title="ARGUS-X Live Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = None
engine_lock = threading.Lock()


def get_engine():
    global engine

    with engine_lock:
        if engine is None:
            from ai_models.identity.recovery_engine import IdentityRecoveryEngine
            engine = IdentityRecoveryEngine()

    return engine


@app.get("/api/health")
def health():
    return {
        "status": "online",
        "system": "ARGUS-X",
        "camera_stream": "/api/stream"
    }


def generate_frames():
    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        camera.release()
        return

    try:
        ai_engine = get_engine()

        while True:
            success, frame = camera.read()

            if not success:
                break

            with engine_lock:
                output = ai_engine.process_frame(frame)

            success, encoded = cv2.imencode(
                ".jpg",
                output,
                [cv2.IMWRITE_JPEG_QUALITY, 80]
            )

            if not success:
                continue

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + encoded.tobytes()
                + b"\r\n"
            )

            time.sleep(0.001)

    finally:
        camera.release()


@app.get("/api/stream")
def camera_stream():
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/api/stats")
def statistics():
    if engine is None:
        return {"status": "not_started"}

    return engine.lifecycle.get_statistics()
