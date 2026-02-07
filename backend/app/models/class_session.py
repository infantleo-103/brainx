import uuid
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class ClassSession(Base):
    __tablename__ = "class_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("batches.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    meeting_link = Column(String, nullable=True)
    is_recorded = Column(Boolean, default=False)

    # Relationships
    batch = relationship("Batch", backref="class_sessions")
    course = relationship("Course", backref="class_sessions")
    teacher = relationship("User", foreign_keys=[teacher_id], backref="taught_sessions")
