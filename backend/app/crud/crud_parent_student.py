from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.models.parent_student import ParentStudent
from app.models.user import User
from app.schemas.parent_student import ParentStudentCreate

class CRUDParentStudent:
    async def create(self, db: AsyncSession, *, obj_in: ParentStudentCreate) -> ParentStudent:
        db_obj = ParentStudent(
            parent_id=obj_in.parent_id,
            student_id=obj_in.student_id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_students_by_parent(self, db: AsyncSession, parent_id: UUID) -> List[User]:
        """
        Get all students associated with a parent.
        Returns a list of User objects (students).
        """
        result = await db.execute(
            select(User)
            .join(ParentStudent, ParentStudent.student_id == User.id)
            .filter(ParentStudent.parent_id == parent_id)
        )
        return result.scalars().all()

    async def get_parents_by_student(self, db: AsyncSession, student_id: UUID) -> List[User]:
        """
        Get all parents associated with a student.
        Returns a list of User objects (parents).
        """
        result = await db.execute(
            select(User)
            .join(ParentStudent, ParentStudent.parent_id == User.id)
            .filter(ParentStudent.student_id == student_id)
        )
        return result.scalars().all()

    async def delete(self, db: AsyncSession, *, parent_id: UUID, student_id: UUID) -> Optional[ParentStudent]:
        result = await db.execute(
            select(ParentStudent)
            .filter(
                ParentStudent.parent_id == parent_id,
                ParentStudent.student_id == student_id
            )
        )
        obj = result.scalars().first()
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

parent_student = CRUDParentStudent()
