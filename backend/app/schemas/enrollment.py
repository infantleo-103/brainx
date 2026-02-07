from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from enum import Enum

class EnrollmentStatusEnum(str, Enum):
    active = "active"
    completed = "completed"
    paused = "paused"

class EnrollmentBase(BaseModel):
    course_id: UUID
    teacher_id: Optional[UUID] = None
    preferred_time: Optional[str] = None

class EnrollmentCreate(EnrollmentBase):
    slot_id: Optional[UUID] = None  # For frontend compatibility

class EnrollmentUpdate(BaseModel):
    teacher_id: Optional[UUID] = None
    preferred_time: Optional[str] = None
    status: Optional[EnrollmentStatusEnum] = None

class EnrollmentInDBBase(EnrollmentBase):
    id: UUID
    student_id: UUID
    enrollment_date: datetime
    status: EnrollmentStatusEnum
    
    class Config:
        from_attributes = True

class Enrollment(EnrollmentInDBBase):
    pass

from app.schemas.course import Course

class EnrollmentResponse(BaseModel):
    id: UUID
    student_id: UUID
    course_id: UUID
    course: Optional[Course] = None
    batch_id: Optional[UUID] = None
    batch_name: Optional[str] = None
    chat_id: Optional[UUID] = None
    enrollment_date: datetime
    status: str
    
    class Config:
        from_attributes = True

class EnrollmentStatus(BaseModel):
    is_enrolled: bool
    enrollment_id: Optional[UUID] = None
    batch_id: Optional[UUID] = None
    enrolled_at: Optional[datetime] = None
