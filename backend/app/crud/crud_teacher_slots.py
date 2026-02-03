from typing import List, Optional, Union, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from datetime import date

from app.models.teacher_slots import TeacherTimeSlot, SlotStatus
from app.schemas.teacher_slots import TeacherSlotCreate, TeacherSlotUpdate

class CRUDTeacherSlot:
    async def get(self, db: AsyncSession, id: int) -> Optional[TeacherTimeSlot]:
        result = await db.execute(select(TeacherTimeSlot).filter(TeacherTimeSlot.id == id))
        return result.scalars().first()

    async def get_by_teacher(self, db: AsyncSession, teacher_id: UUID, skip: int = 0, limit: int = 100) -> List[TeacherTimeSlot]:
        result = await db.execute(select(TeacherTimeSlot).filter(TeacherTimeSlot.teacher_id == teacher_id).offset(skip).limit(limit))
        return result.scalars().all()

    async def get_by_date_range(self, db: AsyncSession, teacher_id: UUID, start_date: date, end_date: date) -> List[TeacherTimeSlot]:
        result = await db.execute(
            select(TeacherTimeSlot)
            .filter(
                TeacherTimeSlot.teacher_id == teacher_id,
                TeacherTimeSlot.slot_date >= start_date,
                TeacherTimeSlot.slot_date <= end_date
            )
            .order_by(TeacherTimeSlot.slot_date, TeacherTimeSlot.slot_start)
        )
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: TeacherSlotCreate) -> TeacherTimeSlot:
        db_obj = TeacherTimeSlot(
            teacher_id=obj_in.teacher_id,
            slot_date=obj_in.slot_date,
            slot_start=obj_in.slot_start,
            slot_end=obj_in.slot_end,
            status=obj_in.status
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def bulk_create(self, db: AsyncSession, *, obj_in: 'BulkSlotCreate') -> List[TeacherTimeSlot]:
        """
        Create multiple 1-hour slots from a time range.
        Example: 08:00-12:00 creates 4 slots: 08-09, 09-10, 10-11, 11-12
        """
        from datetime import datetime, timedelta
        
        created_slots = []
        
        # Convert time to datetime for easier manipulation
        start_dt = datetime.combine(datetime.today(), obj_in.start_time)
        end_dt = datetime.combine(datetime.today(), obj_in.end_time)
        
        # Generate 1-hour slots
        current_time = start_dt
        while current_time < end_dt:
            slot_end = current_time + timedelta(hours=1)
            
            # Create slot for each date
            for slot_date in obj_in.slot_dates:
                db_obj = TeacherTimeSlot(
                    teacher_id=obj_in.teacher_id,
                    slot_date=slot_date,
                    slot_start=current_time.time(),
                    slot_end=slot_end.time(),
                    status=SlotStatus.available
                )
                db.add(db_obj)
                created_slots.append(db_obj)
            
            current_time = slot_end
        
        await db.commit()
        
        # Refresh all objects
        for slot in created_slots:
            await db.refresh(slot)
            
        return created_slots

    async def update(self, db: AsyncSession, *, db_obj: TeacherTimeSlot, obj_in: Union[TeacherSlotUpdate, Dict[str, Any]]) -> TeacherTimeSlot:
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

    async def delete(self, db: AsyncSession, *, id: int) -> Optional[TeacherTimeSlot]:
        result = await db.execute(select(TeacherTimeSlot).filter(TeacherTimeSlot.id == id))
        obj = result.scalars().first()
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

teacher_slot = CRUDTeacherSlot()
