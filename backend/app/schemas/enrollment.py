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
    course_id: int
    teacher_id: Optional[UUID] = None
    preferred_time: Optional[str] = None

class EnrollmentCreate(EnrollmentBase):
    slot_id: Optional[int] = None  # For frontend compatibility

class EnrollmentUpdate(BaseModel):
    teacher_id: Optional[UUID] = None
    preferred_time: Optional[str] = None
    status: Optional[EnrollmentStatusEnum] = None

class EnrollmentInDBBase(EnrollmentBase):
    id: int
    student_id: UUID
    enrollment_date: datetime
    status: EnrollmentStatusEnum
    
    class Config:
        from_attributes = True

class Enrollment(EnrollmentInDBBase):
    pass

from app.schemas.course import Course

class EnrollmentResponse(BaseModel):
    id: int
    student_id: UUID
    course_id: int
    course: Optional[Course] = None
    batch_id: Optional[int] = None
    batch_name: Optional[str] = None
    chat_id: Optional[int] = None
    enrollment_date: datetime
    status: str
    
    class Config:
        from_attributes = True

class EnrollmentStatus(BaseModel):
    is_enrolled: bool
    enrollment_id: Optional[int] = None
    batch_id: Optional[int] = None
    enrolled_at: Optional[datetime] = None
