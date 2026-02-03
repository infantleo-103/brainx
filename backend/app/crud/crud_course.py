from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.course import Course, CourseCategory
from app.schemas.course import CourseCreate, CourseUpdate, CourseCategoryCreate, CourseCategoryUpdate

class CRUDCourseCategory:
    async def get(self, db: AsyncSession, id: int) -> Optional[CourseCategory]:
        result = await db.execute(select(CourseCategory).filter(CourseCategory.id == id))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[CourseCategory]:
        result = await db.execute(select(CourseCategory).offset(skip).limit(limit))
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: CourseCategoryCreate) -> CourseCategory:
        db_obj = CourseCategory(
            name=obj_in.name,
            description=obj_in.description
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, *, db_obj: CourseCategory, obj_in: CourseCategoryUpdate) -> CourseCategory:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, id: int) -> CourseCategory:
        result = await db.execute(select(CourseCategory).filter(CourseCategory.id == id))
        obj = result.scalars().first()
        await db.delete(obj)
        await db.commit()
        return obj

class CRUDCourse:
    async def get(self, db: AsyncSession, id: int) -> Optional[Course]:
        result = await db.execute(
            select(Course)
            .options(selectinload(Course.badge), selectinload(Course.provider))
            .filter(Course.id == id)
        )
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[Course]:
        result = await db.execute(
            select(Course)
            .options(selectinload(Course.badge), selectinload(Course.provider))
            .offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def get_by_badge(self, db: AsyncSession, *, badge_id: int, skip: int = 0, limit: int = 100) -> List[Course]:
        result = await db.execute(
            select(Course)
            .options(selectinload(Course.badge), selectinload(Course.provider))
            .filter(Course.badge_id == badge_id)
            .offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: CourseCreate) -> Course:
        db_obj = Course(
            title=obj_in.title,
            description=obj_in.description,
            level=obj_in.level,
            duration_hours=obj_in.duration_hours,
            duration_weeks=obj_in.duration_weeks,
            status=obj_in.status,
            category_id=obj_in.category_id,
            provider_id=obj_in.provider_id,
            badge_id=obj_in.badge_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        # Return fully loaded object with relationships to avoid MissingGreenlet error
        return await self.get(db, id=db_obj.id)

    async def update(self, db: AsyncSession, *, db_obj: Course, obj_in: CourseUpdate) -> Course:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        # Return fully loaded object with relationships
        return await self.get(db, id=db_obj.id)

    async def remove(self, db: AsyncSession, *, id: int) -> Course:
        result = await db.execute(select(Course).filter(Course.id == id))
        obj = result.scalars().first()
        await db.delete(obj)
        await db.commit()
        return obj

course_category = CRUDCourseCategory()
course = CRUDCourse()
