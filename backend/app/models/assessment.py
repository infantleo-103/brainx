import uuid
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.db.base import Base

class AssessmentType(str, enum.Enum):
    exam = "exam"
    quiz = "quiz"
    homework = "homework"

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("batches.id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    type = Column(Enum(AssessmentType), default=AssessmentType.quiz)
    total_marks = Column(Integer, default=100)
    due_date = Column(DateTime(timezone=True), nullable=True)
    template_url = Column(String, nullable=True) # URL to Bunny.net JSON storage
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", backref="assessments")
    batch = relationship("Batch", backref="assessments")
    submissions = relationship("AssessmentSubmission", back_populates="assessment")

class AssessmentSubmission(Base):
    __tablename__ = "assessment_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    marks_obtained = Column(Integer, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="submissions")
    student = relationship("User", backref="assessment_submissions")
