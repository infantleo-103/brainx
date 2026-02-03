from typing import List, Optional, Union, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.course_badge import CourseBadge
from app.schemas.course_badge import CourseBadgeCreate, CourseBadgeUpdate

class CRUDCourseBadge:
    async def get(self, db: AsyncSession, id: int) -> Optional[CourseBadge]:
        result = await db.execute(select(CourseBadge).filter(CourseBadge.id == id))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[CourseBadge]:
        result = await db.execute(select(CourseBadge).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: CourseBadgeCreate) -> CourseBadge:
        db_obj = CourseBadge(
            badge_text=obj_in.badge_text,
            badge_icon=obj_in.badge_icon,
            badge_type=obj_in.badge_type,
            css_class_name=obj_in.css_class_name
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, *, db_obj: CourseBadge, obj_in: Union[CourseBadgeUpdate, Dict[str, Any]]) -> CourseBadge:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, id: int) -> Optional[CourseBadge]:
        result = await db.execute(select(CourseBadge).filter(CourseBadge.id == id))
        obj = result.scalars().first()
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

course_badge = CRUDCourseBadge()
