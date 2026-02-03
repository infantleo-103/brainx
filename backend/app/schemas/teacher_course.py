from pydantic import BaseModel, ConfigDict
from uuid import UUID
from app.schemas.user import UserResponse
from typing import Optional

class TeacherCourseBase(BaseModel):
    teacher_id: UUID
    course_id: int

class TeacherCourseCreate(TeacherCourseBase):
    pass

class TeacherCourse(TeacherCourseBase):
    id: int
    teacher: Optional[UserResponse] = None
    
    model_config = ConfigDict(from_attributes=True)
