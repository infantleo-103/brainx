from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.crud.crud_role import role as crud_role
from app.models.user import User
from app.models.permission import Permission as PermissionModel
from app.schemas.permission import PermissionCreate
from app.schemas.role import Role, RoleCreate, RoleUpdate, RoleWithCount

router = APIRouter()

@router.post("/{role_id}/permissions", response_model=Role)
async def update_role_permissions(
    *,
    db: AsyncSession = Depends(deps.get_db),
    role_id: int,
    permissions_in: List[PermissionCreate],
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update permissions for a role.
    """
    role = await crud_role.get(db, id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Fetch existing permissions for this role
    from sqlalchemy import select
    result = await db.execute(select(PermissionModel).where(PermissionModel.role_id == role_id))
    existing_permissions = result.scalars().all()
    
    # Map map by module for easy lookup
    existing_perms_map = {perm.module: perm for perm in existing_permissions}

    for perm_in in permissions_in:
        if perm_in.module in existing_perms_map:
            # Update existing permission
            existing_perm = existing_perms_map[perm_in.module]
            for field, value in perm_in.model_dump().items():
                setattr(existing_perm, field, value)
            db.add(existing_perm)
        else:
            # Create new permission
            permission = PermissionModel(**perm_in.model_dump(), role_id=role_id)
            db.add(permission)
    
    await db.commit()
    await db.refresh(role)
    return role


@router.get("/", response_model=List[RoleWithCount])
async def read_roles(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve roles.
    """
    roles = await crud_role.get_multi_with_count(db, skip=skip, limit=limit)
    return roles

@router.post("/", response_model=Role)
async def create_role(
    *,
    db: AsyncSession = Depends(deps.get_db),
    role_in: RoleCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new role.
    """
    role = await crud_role.get_by_name(db, name=role_in.name)
    if role:
        raise HTTPException(
            status_code=400,
            detail="The role with this name already exists in the system.",
        )
    role = await crud_role.create(db, obj_in=role_in)
    return role

@router.get("/{role_id}", response_model=Role)
async def read_role(
    *,
    db: AsyncSession = Depends(deps.get_db),
    role_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get role by ID.
    """
    role = await crud_role.get(db, id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.put("/{role_id}", response_model=Role)
async def update_role(
    *,
    db: AsyncSession = Depends(deps.get_db),
    role_id: int,
    role_in: RoleUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a role.
    """
    role = await crud_role.get(db, id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role = await crud_role.update(db, db_obj=role, obj_in=role_in)
    return role

@router.delete("/{role_id}", response_model=Role)
async def delete_role(
    *,
    db: AsyncSession = Depends(deps.get_db),
    role_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a role.
    """
    role = await crud_role.get(db, id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role = await crud_role.remove(db, id=role_id)
    return role
