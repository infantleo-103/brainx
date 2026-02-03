from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas import course_badge as schemas
from app.crud.crud_course_badge import course_badge
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas.CourseBadge])
async def read_badges(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve all course badges.
    """
    badges = await course_badge.get_multi(db, skip=skip, limit=limit)
    return badges


@router.post("/", response_model=schemas.CourseBadge)
async def create_badge(
    *,
    db: AsyncSession = Depends(deps.get_db),
    badge_in: schemas.CourseBadgeCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new course badge (Admin/Coordinator).
    """
    if current_user.role not in ["admin", "coordinator"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    obj = await course_badge.create(db=db, obj_in=badge_in)
    return obj


@router.delete("/{id}", response_model=schemas.CourseBadge)
async def delete_badge(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a badge (Admin/Coordinator).
    """
    if current_user.role not in ["admin", "coordinator"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    obj = await course_badge.delete(db=db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Badge not found")
    return obj
