from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.users import get_db
from app.core import security
from app.core.config import settings
from app.schemas.token import Token
from app.services.user_service import user_service
from app.models.user import UserStatus

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Only users with status='active' can login.
    """
    user = await user_service.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Only allow active users to login
    if user.status != UserStatus.active:
        if user.status == UserStatus.requested:
            raise HTTPException(status_code=403, detail="Your account is pending admin approval. Please wait for activation.")
        elif user.status == UserStatus.disabled:
            raise HTTPException(status_code=403, detail="Your account has been disabled. Please contact support.")
        else:
            raise HTTPException(status_code=403, detail="Your account is not active. Please contact support.")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.email, role=user.role.name if user.role else None, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

