from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.crud.crud_teacher_course import teacher_course as crud_teacher_course
from app.schemas.teacher_course import TeacherCourse, TeacherCourseCreate

router = APIRouter()

@router.post("/", response_model=TeacherCourse)
async def assign_teacher_to_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    teacher_course_in: TeacherCourseCreate,
    # current_user: User = Depends(deps.get_current_active_superuser), # Uncomment to restrict
) -> Any:
    """
    Assign a teacher to a course.
    """
    # Check if assignment already exists
    existing = await crud_teacher_course.get_by_teacher_and_course(
        db, teacher_id=teacher_course_in.teacher_id, course_id=teacher_course_in.course_id
    )
    if existing:
        return existing
        # Or raise HTTPException(status_code=400, detail="Assignment already exists")

    teacher_course = await crud_teacher_course.create(db, obj_in=teacher_course_in)
    return teacher_course

@router.delete("/{id}", response_model=TeacherCourse)
async def remove_teacher_from_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: UUID,
    # current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Remove a teacher assignment by ID.
    """
    teacher_course = await crud_teacher_course.get(db, id=id)
    if not teacher_course:
        raise HTTPException(status_code=404, detail="Assignment not found")
    teacher_course = await crud_teacher_course.remove(db, id=id)
    return teacher_course

@router.get("/teacher/{teacher_id}", response_model=List[TeacherCourse])
async def read_courses_by_teacher(
    *,
    db: AsyncSession = Depends(deps.get_db),
    teacher_id: UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve courses assigned to a teacher.
    """
    courses = await crud_teacher_course.get_by_teacher(db, teacher_id=teacher_id, skip=skip, limit=limit)
    return courses

@router.get("/course/{course_id}", response_model=List[TeacherCourse])
async def read_teachers_by_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    course_id: UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve teachers assigned to a course.
    """
    teachers = await crud_teacher_course.get_by_course(db, course_id=course_id, skip=skip, limit=limit)
    return teachers
