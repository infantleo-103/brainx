from typing import Optional, List
from pydantic import BaseModel

# Course Category Schemas
class CourseCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CourseCategoryCreate(CourseCategoryBase):
    pass

class CourseCategoryUpdate(CourseCategoryBase):
    pass

class CourseCategoryInDBBase(CourseCategoryBase):
    id: int

    class Config:
        from_attributes = True

class CourseCategory(CourseCategoryInDBBase):
    pass

# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    level: str
    duration_hours: int
    duration_weeks: int
    image: Optional[str] = None
    status: bool = True
    category_id: int
    provider_id: Optional[int] = None
    badge_id: Optional[int] = None

class BadgeSchema(BaseModel):
    text: str
    icon: Optional[str] = None
    className: Optional[str] = None

class ProviderSchema(BaseModel):
    name: str
    className: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    duration_hours: Optional[int] = None
    duration_weeks: Optional[int] = None
    image: Optional[str] = None
    status: Optional[bool] = None
    category_id: Optional[int] = None

class CourseInDBBase(CourseBase):
    id: int

    class Config:
        from_attributes = True

class Course(CourseInDBBase):
    badge: Optional[BadgeSchema] = None
    provider: Optional[ProviderSchema] = None
    
    # Placeholder fields for frontend compatibility
    rating: str = "4.9"
    metaText: str = "2.5k enrolled"
    metaClassName: str = "font-sans"
    price: str = "$199"

    class Config:
        from_attributes = True

    @classmethod
    def model_validate(cls, obj):
        # Allow mapped conversion from ORM models to these specific schemas
        if hasattr(obj, 'badge') and obj.badge:
             # Manually map ORM badge to BadgeSchema if needed, or rely on pydantic
             # Pydantic's from_attributes usually handles name matching, but here names differ
             # badge_text -> text, badge_icon -> icon, css_class_name -> className
             
             # We might need a custom validator or property if simple aliasing isn't enough/possible easily
             # Alternatively, we can use Field(alias=...) but that affects input too.
             # Let's try to construct it if it's an ORM object.
             pass
        return super().model_validate(obj)

class CourseWithCategory(Course):
    category: Optional[CourseCategory] = None
