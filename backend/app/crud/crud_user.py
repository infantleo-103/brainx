from typing import List, Optional, Any, Union, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

class CRUDUser:
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

    async def get(self, db: AsyncSession, id: Any) -> Optional[User]:
        result = await db.execute(select(User).filter(User.id == id))
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        db_obj = User(
            full_name=obj_in.full_name,
            email=obj_in.email,
            phone=obj_in.phone,
            password_hash=get_password_hash(obj_in.password),
            role=obj_in.role,
            status=obj_in.status
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[User]:
        result = await db.execute(select(User).offset(skip).limit(limit))
        return result.scalars().all()

    async def search(self, db: AsyncSession, *, query: str, skip: int = 0, limit: int = 100) -> List[User]:
        from sqlalchemy import or_
        term = f"%{query}%"
        result = await db.execute(
            select(User)
            .filter(
                or_(
                    User.full_name.ilike(term),
                    User.email.ilike(term),
                    User.phone.ilike(term)
                )
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def update(self, db: AsyncSession, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["password_hash"] = hashed_password

        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, id: Any) -> User:
        result = await db.execute(select(User).filter(User.id == id))
        obj = result.scalars().first()
        await db.delete(obj)
        await db.commit()
        return obj

user = CRUDUser()
