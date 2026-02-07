from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from app.models.course_badge import BadgeType

class CourseBadgeBase(BaseModel):
    badge_text: str
    badge_icon: Optional[str] = ""
    badge_type: BadgeType
    css_class_name: Optional[str] = ""

class CourseBadgeCreate(CourseBadgeBase):
    pass

class CourseBadgeUpdate(BaseModel):
    badge_text: Optional[str] = None
    badge_icon: Optional[str] = None
    badge_type: Optional[BadgeType] = None
    css_class_name: Optional[str] = None

from uuid import UUID

class CourseBadge(CourseBadgeBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

    @staticmethod
    def _validate_none_to_string(v: Any) -> Any:
        if v is None:
            return ""
        return v

    from pydantic import field_validator

    @field_validator('badge_icon', 'css_class_name', mode='before')
    @classmethod
    def set_null_to_string(cls, v: Optional[str]) -> str:
        return cls._validate_none_to_string(v)
