from datetime import date, time, datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator
from enum import Enum

class SlotStatus(str, Enum):
    available = "available"
    booked = "booked"
    blocked = "blocked"

class TeacherSlotBase(BaseModel):
    slot_date: date
    slot_start: time
    slot_end: time
    status: SlotStatus = SlotStatus.available
    
class TeacherSlotCreate(TeacherSlotBase):
    teacher_id: UUID

class BulkSlotCreate(BaseModel):
    """
    Create multiple 1-hour slots automatically.
    Example: start_time=08:00, end_time=12:00 creates slots:
    08:00-09:00, 09:00-10:00, 10:00-11:00, 11:00-12:00
    """
    teacher_id: UUID
    slot_dates: List[date]  # Can create slots for multiple dates
    start_time: time
    end_time: time
    
    @field_validator('end_time')
    @classmethod
    def validate_time_range(cls, v, info):
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError('end_time must be after start_time')
        return v

class TeacherSlotUpdate(BaseModel):
    slot_date: Optional[date] = None
    slot_start: Optional[time] = None
    slot_end: Optional[time] = None
    status: Optional[SlotStatus] = None
    booked_by: Optional[UUID] = None
    batch_id: Optional[UUID] = None

class TeacherSlot(TeacherSlotBase):
    id: UUID
    teacher_id: UUID
    booked_by: Optional[UUID] = None
    batch_id: Optional[UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
