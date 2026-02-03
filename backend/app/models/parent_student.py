from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class ParentStudent(Base):
    __tablename__ = "parent_student"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id], backref="children_relationships")
    student = relationship("User", foreign_keys=[student_id], backref="parent_relationships")
