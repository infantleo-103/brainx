import uuid
from sqlalchemy import Column, Time, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class TeacherTimeSlot(Base):
    """
    Teacher availability for weekdays (Mon-Fri) and weekends (Sat-Sun).
    Each teacher has one row with their recurring availability settings.
    
    Uses existing teacher_time_slots table - schema modified for weekday/weekend pattern.
    """
    __tablename__ = "teacher_time_slots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Weekday availability (Monday-Friday)
    weekday_available = Column(Boolean, default=False, nullable=False)
    weekday_start = Column(Time, nullable=True)
    weekday_end = Column(Time, nullable=True)
    
    # Weekend availability (Saturday-Sunday)
    weekend_available = Column(Boolean, default=False, nullable=False)
    weekend_start = Column(Time, nullable=True)
    weekend_end = Column(Time, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    teacher = relationship("User", backref="teacher_slots")
