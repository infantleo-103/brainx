from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate

class CRUDRole:
    async def get(self, db: AsyncSession, id: int) -> Optional[Role]:
        result = await db.execute(select(Role).filter(Role.id == id))
        return result.scalars().first()

    async def get_by_name(self, db: AsyncSession, *, name: str) -> Optional[Role]:
        result = await db.execute(select(Role).filter(Role.name == name))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[Role]:
        result = await db.execute(select(Role).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_multi_with_count(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[dict]:
        from app.models.user import User
        from sqlalchemy import func
        
        # Get roles with pagination
        roles_result = await db.execute(select(Role).offset(skip).limit(limit))
        roles = roles_result.scalars().all()
        
        roles_with_count = []
        for role in roles:
            # Count users with this role name (case-insensitive or exact match depending on how it's stored)
            # User.role is Enum, Role.name is String.
            # Assuming Role.name matches Enum value.
            count_query = select(func.count(User.id)).where(User.role == role.name.lower())
            count_result = await db.execute(count_query)
            count = count_result.scalar()
            
            # Convert to dict/schema compatible format
            role_dict = {
                "id": role.id,
                "name": role.name,
                "description": role.description,
                "permissions": role.permissions,
                "user_count": count or 0
            }
            roles_with_count.append(role_dict)
            
        return roles_with_count

    async def create(self, db: AsyncSession, *, obj_in: RoleCreate) -> Role:
        db_obj = Role(
            name=obj_in.name,
            description=obj_in.description
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, *, db_obj: Role, obj_in: RoleUpdate) -> Role:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, id: int) -> Role:
        result = await db.execute(select(Role).filter(Role.id == id))
        obj = result.scalars().first()
        await db.delete(obj)
        await db.commit()
        return obj

role = CRUDRole()
