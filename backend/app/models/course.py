from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

import uuid
from sqlalchemy.dialects.postgresql import UUID

class CourseCategory(Base):
    __tablename__ = "course_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)

    courses = relationship("Course", back_populates="category", cascade="all, delete-orphan")

class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("course_categories.id"))
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    level = Column(String)
    duration_hours = Column(Integer)
    duration_weeks = Column(Integer)
    image = Column(String, nullable=True)
    status = Column(Boolean, default=True)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("providers.id"), nullable=True)

    category = relationship("CourseCategory", back_populates="courses")
    provider = relationship("Provider", backref="courses")
    badge_id = Column(UUID(as_uuid=True), ForeignKey("course_badges.id"), nullable=True)
    badge = relationship("CourseBadge", backref="courses_linked")
