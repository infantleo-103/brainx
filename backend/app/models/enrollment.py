from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class EnrollmentStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    paused = "paused"

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    preferred_time = Column(String, nullable=True)
    enrollment_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.active)
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id], backref="enrollments")
    course = relationship("Course", backref="enrollments")
    teacher = relationship("User", foreign_keys=[teacher_id], backref="teaching_enrollments")
