from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.schemas.enrollment import EnrollmentCreate, EnrollmentUpdate

class CRUDEnrollment:
    async def get(self, db: AsyncSession, id: int) -> Optional[Enrollment]:
        result = await db.execute(select(Enrollment).filter(Enrollment.id == id))
        return result.scalars().first()

    async def get_by_student_and_course(
        self, db: AsyncSession, *, student_id: UUID, course_id: int
    ) -> Optional[Enrollment]:
        """Check if student is enrolled in a course"""
        result = await db.execute(
            select(Enrollment)
            .filter(
                Enrollment.student_id == student_id,
                Enrollment.course_id == course_id,
                Enrollment.status == EnrollmentStatus.active
            )
        )
        return result.scalars().first()

    async def get_by_student(
        self, db: AsyncSession, *, student_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Enrollment]:
        """Get all enrollments for a student"""
        result = await db.execute(
            select(Enrollment)
            .options(
                selectinload(Enrollment.course).selectinload(Course.badge),
                selectinload(Enrollment.course).selectinload(Course.provider),
                selectinload(Enrollment.course).selectinload(Course.category)
            )
            .filter(Enrollment.student_id == student_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_by_course(
        self, db: AsyncSession, *, course_id: int, skip: int = 0, limit: int = 100
    ) -> List[Enrollment]:
        """Get all enrollments for a course"""
        result = await db.execute(
            select(Enrollment)
            .options(selectinload(Enrollment.student))
            .filter(Enrollment.course_id == course_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: EnrollmentCreate, student_id: UUID) -> Enrollment:
        """Create new enrollment"""
        db_obj = Enrollment(
            student_id=student_id,
            course_id=obj_in.course_id,
            teacher_id=obj_in.teacher_id,
            preferred_time=obj_in.preferred_time,
            status=EnrollmentStatus.active
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, *, db_obj: Enrollment, obj_in: EnrollmentUpdate
    ) -> Enrollment:
        """Update enrollment"""
        update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Enrollment]:
        result = await db.execute(select(Enrollment).offset(skip).limit(limit))
        return result.scalars().all()

enrollment = CRUDEnrollment()
