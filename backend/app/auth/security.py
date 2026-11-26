
import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext


SECRET_KEY = os.getenv("ARGUS_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "ARGUS_SECRET_KEY must be configured in the environment"
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )
def create_access_token(data: dict, expires_delta=None):
    payload = data.copy()

    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.now(timezone.utc) + expires_delta
    payload.update({"exp": expire})

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

   