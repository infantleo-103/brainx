from typing import List, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate, UserResponse
from app.core.security import verify_password

class UserService:
    async def create_new_user(self, db: AsyncSession, user_in: UserCreate) -> UserResponse:
        existing_user = await crud_user.get_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        return await crud_user.create(db, obj_in=user_in)

    async def get_users(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        return await crud_user.get_multi(db, skip=skip, limit=limit)

    async def search_users(self, db: AsyncSession, query: str, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        return await crud_user.search(db, query=query, skip=skip, limit=limit)

    async def update_user(self, db: AsyncSession, *, user: Any, user_in: Any) -> UserResponse:
        return await crud_user.update(db, db_obj=user, obj_in=user_in)


    async def authenticate(self, db: AsyncSession, email: str, password: str):
        user = await crud_user.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

user_service = UserService()
