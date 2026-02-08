from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api import deps
from app.schemas import teacher_slots as schemas
from app.crud.crud_teacher_slots import teacher_availability
from app.models.user import User

router = APIRouter()


@router.get("/{teacher_id}", response_model=schemas.TeacherAvailability)
async def get_teacher_availability(
    *,
    db: AsyncSession = Depends(deps.get_db),
    teacher_id: UUID,
) -> Any:
    """
    Get teacher's availability settings.
    """
    availability = await teacher_availability.get_by_teacher(db, teacher_id=teacher_id)
    if not availability:
        # Return empty availability structure
        raise HTTPException(status_code=404, detail="Availability not set")
    return availability


@router.put("/{teacher_id}", response_model=schemas.TeacherAvailability)
async def update_teacher_availability(
    *,
    db: AsyncSession = Depends(deps.get_db),
    teacher_id: UUID,
    availability_in: schemas.TeacherAvailabilityUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create or update teacher's availability settings.
    """
    # Permission check: Only the teacher themselves or admin can update
    if str(current_user.id) != str(teacher_id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this teacher's availability")
    
    result = await teacher_availability.create_or_update(
        db, 
        teacher_id=teacher_id, 
        obj_in=availability_in
    )
    return result


@router.delete("/{teacher_id}", response_model=schemas.TeacherAvailability)
async def delete_teacher_availability(
    *,
    db: AsyncSession = Depends(deps.get_db),
    teacher_id: UUID,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete teacher's availability settings.
    """
    existing = await teacher_availability.get_by_teacher(db, teacher_id=teacher_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Availability not found")
    
    # Permission check
    if str(current_user.id) != str(teacher_id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this teacher's availability")
    
    result = await teacher_availability.delete(db, id=existing.id)
    return result
