from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Optional

class ParentStudentBase(BaseModel):
    parent_id: UUID
    student_id: UUID

class ParentStudentCreate(ParentStudentBase):
    pass

class ParentStudent(ParentStudentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
