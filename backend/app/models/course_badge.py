import uuid
from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
import enum

class BadgeType(str, enum.Enum):
    hot = "hot"
    new = "new"
    trending = "trending"
    popular = "popular"

class CourseBadge(Base):
    __tablename__ = "course_badges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    badge_text = Column(String, nullable=False)
    badge_icon = Column(String, nullable=True)
    badge_type = Column(Enum(BadgeType), nullable=False)
    css_class_name = Column(String, nullable=True)

    @property
    def text(self):
        return self.badge_text

    @property
    def icon(self):
        return self.badge_icon

    @property
    def className(self):
        return self.css_class_name
