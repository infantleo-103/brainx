from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.crud.crud_course import course as crud_course, course_category as crud_course_category
from app.models.user import User
from app.schemas.course import (
    Course, CourseCreate, CourseUpdate,
    CourseCategory, CourseCategoryCreate, CourseCategoryUpdate
)

router = APIRouter()

# Course Categories

@router.get("/categories/", response_model=List[CourseCategory])
async def read_course_categories(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve course categories.
    """
    categories = await crud_course_category.get_multi(db, skip=skip, limit=limit)
    return categories

@router.post("/categories/", response_model=CourseCategory)
async def create_course_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_in: CourseCategoryCreate,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new course category.
    """
    category = await crud_course_category.create(db, obj_in=category_in)
    return category

@router.put("/categories/{category_id}", response_model=CourseCategory)
async def update_course_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_id: UUID,
    category_in: CourseCategoryUpdate,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a course category.
    """
    category = await crud_course_category.get(db, id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Course category not found")
    category = await crud_course_category.update(db, db_obj=category, obj_in=category_in)
    return category

@router.delete("/categories/{category_id}", response_model=CourseCategory)
async def delete_course_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_id: UUID,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a course category.
    """
    category = await crud_course_category.get(db, id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Course category not found")
    category = await crud_course_category.remove(db, id=category_id)
    return category

# Courses

@router.get("/", response_model=List[Course])
async def read_courses(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve courses.
    """
    courses = await crud_course.get_multi(db, skip=skip, limit=limit)
    return courses

@router.post("/", response_model=Course)
async def create_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    course_in: CourseCreate,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new course.
    """
    course = await crud_course.create(db, obj_in=course_in)
    return course

@router.get("/badge/{badge_id}", response_model=List[Course])
async def read_courses_by_badge(
    *,
    db: AsyncSession = Depends(deps.get_db),
    badge_id: UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve courses by badge ID.
    """
    courses = await crud_course.get_by_badge(db, badge_id=badge_id, skip=skip, limit=limit)
    return courses

@router.get("/category/{category_id}", response_model=List[Course])
async def read_courses_by_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_id: UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve courses by category ID.
    """
    courses = await crud_course.get_by_category(db, category_id=category_id, skip=skip, limit=limit)
    return courses

@router.get("/{course_id}", response_model=Course)
async def read_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    course_id: UUID,
) -> Any:
    """
    Get course by ID.
    """
    course = await crud_course.get(db, id=course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=Course)
async def update_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    course_id: UUID,
    course_in: CourseUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a course.
    """
    course = await crud_course.get(db, id=course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course = await crud_course.update(db, db_obj=course, obj_in=course_in)
    return course

@router.delete("/{course_id}", response_model=Course)
async def delete_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    course_id: UUID,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a course.
    """
    course = await crud_course.get(db, id=course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course = await crud_course.remove(db, id=course_id)
    return course
