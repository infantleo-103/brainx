from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime
from app.models.assessment import AssessmentType

class AssessmentBase(BaseModel):
    title: str
    course_id: int
    batch_id: int
    type: AssessmentType = AssessmentType.quiz
    total_marks: int = 100
    due_date: Optional[datetime] = None

class AssessmentCreate(AssessmentBase):
    questions: Dict[str, Any] # JSON structure of questions

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[AssessmentType] = None
    total_marks: Optional[int] = None
    due_date: Optional[datetime] = None
    questions: Optional[Dict[str, Any]] = None

class AssessmentInDBBase(AssessmentBase):
    id: int
    template_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Assessment(AssessmentInDBBase):
    pass

class AssessmentResponse(AssessmentInDBBase):
    course_name: Optional[str] = None
    batch_name: Optional[str] = None
