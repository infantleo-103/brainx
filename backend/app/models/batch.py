from sqlalchemy import Column, Integer, String, Date, DECIMAL, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.db.base import Base

class BatchMemberRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    coordinator = "coordinator"
    counselor = "counselor"
    support = "support"

class BatchMemberStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    batch_name = Column(String, index=True, nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # Assuming 'users' table exists
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    total_hours = Column(Integer, default=0)
    consumed_hours = Column(DECIMAL(5, 2), default=0.0)
    remaining_hours = Column(DECIMAL(5, 2), default=0.0)
    schedule_time = Column(String, nullable=True)
    status = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", backref="batches")
    teacher = relationship("User", foreign_keys=[teacher_id], backref="teaching_batches")
    members = relationship("BatchMember", back_populates="batch", cascade="all, delete-orphan")


class BatchMember(Base):
    __tablename__ = "batch_members"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    role = Column(Enum(BatchMemberRole), default=BatchMemberRole.student)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(BatchMemberStatus), default=BatchMemberStatus.active)

    # Relationships
    batch = relationship("Batch", back_populates="members")
    user = relationship("User", foreign_keys=[user_id], backref="batch_memberships")
    system_role = relationship("Role", foreign_keys=[role_id])
