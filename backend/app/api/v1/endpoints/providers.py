from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.schemas import provider as schemas
from app.crud.crud_provider import provider
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=schemas.Provider)
async def create_provider(
    *,
    db: AsyncSession = Depends(deps.get_db),
    provider_in: schemas.ProviderCreate,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new provider (Admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    obj = await provider.create(db=db, obj_in=provider_in)
    return obj

@router.get("/", response_model=List[schemas.Provider])
async def read_providers(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve providers.
    """
    obj_list = await provider.get_multi(db, skip=skip, limit=limit)
    return obj_list

@router.get("/{id}", response_model=schemas.Provider)
async def read_provider(
    id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get provider by ID.
    """
    obj = await provider.get(db=db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Provider not found")
    return obj

@router.put("/{id}", response_model=schemas.Provider)
async def update_provider(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    provider_in: schemas.ProviderUpdate,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a provider (Admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    obj = await provider.get(db=db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Provider not found")
        
    obj = await provider.update(db=db, db_obj=obj, obj_in=provider_in)
    return obj

@router.delete("/{id}", response_model=schemas.Provider)
async def delete_provider(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a provider (Admin only).
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    obj = await provider.delete(db=db, id=id)
    if not obj:
        raise HTTPException(status_code=404, detail="Provider not found")
    return obj
