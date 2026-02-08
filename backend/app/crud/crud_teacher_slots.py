from typing import Optional, Union, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.models.teacher_slots import TeacherTimeSlot
from app.schemas.teacher_slots import TeacherAvailabilityCreate, TeacherAvailabilityUpdate


class CRUDTeacherAvailability:
    
    async def get(self, db: AsyncSession, id: UUID) -> Optional[TeacherTimeSlot]:
        """Get availability by ID"""
        result = await db.execute(
            select(TeacherTimeSlot).filter(TeacherTimeSlot.id == id)
        )
        return result.scalars().first()

    async def get_by_teacher(self, db: AsyncSession, teacher_id: UUID) -> Optional[TeacherTimeSlot]:
        """Get availability by teacher ID"""
        result = await db.execute(
            select(TeacherTimeSlot).filter(TeacherTimeSlot.teacher_id == teacher_id)
        )
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: TeacherAvailabilityCreate) -> TeacherTimeSlot:
        """Create new availability record"""
        db_obj = TeacherTimeSlot(
            teacher_id=obj_in.teacher_id,
            weekday_available=obj_in.weekday_available,
            weekday_start=obj_in.weekday_start,
            weekday_end=obj_in.weekday_end,
            weekend_available=obj_in.weekend_available,
            weekend_start=obj_in.weekend_start,
            weekend_end=obj_in.weekend_end,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def create_or_update(self, db: AsyncSession, *, teacher_id: UUID, obj_in: TeacherAvailabilityUpdate) -> TeacherTimeSlot:
        """Create or update availability for a teacher (upsert)"""
        existing = await self.get_by_teacher(db, teacher_id=teacher_id)
        
        if existing:
            return await self.update(db, db_obj=existing, obj_in=obj_in)
        else:
            # Create new record
            create_data = TeacherAvailabilityCreate(
                teacher_id=teacher_id,
                weekday_available=obj_in.weekday_available or False,
                weekday_start=obj_in.weekday_start,
                weekday_end=obj_in.weekday_end,
                weekend_available=obj_in.weekend_available or False,
                weekend_start=obj_in.weekend_start,
                weekend_end=obj_in.weekend_end,
            )
            return await self.create(db, obj_in=create_data)

    async def update(self, db: AsyncSession, *, db_obj: TeacherTimeSlot, obj_in: Union[TeacherAvailabilityUpdate, Dict[str, Any]]) -> TeacherTimeSlot:
        """Update existing availability"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if hasattr(db_obj, field) and value is not None:
                setattr(db_obj, field, value)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, id: UUID) -> Optional[TeacherTimeSlot]:
        """Delete availability by ID"""
        result = await db.execute(
            select(TeacherTimeSlot).filter(TeacherTimeSlot.id == id)
        )
        obj = result.scalars().first()
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj


teacher_availability = CRUDTeacherAvailability()
