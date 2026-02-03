from sqlalchemy import Column, Integer, Time, Date, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class SlotStatus(str, enum.Enum):
    available = "available"
    booked = "booked"
    blocked = "blocked"

class TeacherTimeSlot(Base):
    __tablename__ = "teacher_time_slots"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    slot_date = Column(Date, nullable=False, index=True)
    slot_start = Column(Time, nullable=False)
    slot_end = Column(Time, nullable=False)
    status = Column(Enum(SlotStatus), default=SlotStatus.available, nullable=False)
    booked_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id], backref="teacher_slots")
    booked_user = relationship("User", foreign_keys=[booked_by], backref="booked_slots")
    batch = relationship("Batch", backref="time_slots")
