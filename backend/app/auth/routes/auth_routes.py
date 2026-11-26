
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    TokenResponse
)
from backend.app.auth.security import (
    hash_password,
    verify_password,
    create_access_token
)
from backend.app.database.connection import get_db
from backend.app.database.models import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        (User.email == data.email) |
        (User.username == data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already registered"
        )

    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        role="viewer"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "sub": str(new_user.id),
        "role": new_user.role
    })

    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user or not verify_password(
        data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {"access_token": token, "token_type": "bearer"}