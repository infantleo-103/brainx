from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional

class ClassSessionBase(BaseModel):
    batch_id: UUID
    course_id: UUID
    teacher_id: UUID
    start_time: datetime
    end_time: datetime
    meeting_link: Optional[str] = None
    is_recorded: bool = False

class ClassSessionCreate(ClassSessionBase):
    pass

class ClassSessionUpdate(BaseModel):
    batch_id: Optional[UUID] = None
    course_id: Optional[UUID] = None
    teacher_id: Optional[UUID] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    meeting_link: Optional[str] = None
    is_recorded: Optional[bool] = None

class ClassSession(ClassSessionBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
