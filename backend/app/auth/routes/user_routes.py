
from fastapi import APIRouter, Depends
from backend.app.auth.dependencies import get_current_user
from backend.app.database.models import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active
    }