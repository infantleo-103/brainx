from typing import Optional
from pydantic import BaseModel

class PermissionBase(BaseModel):
    module: str
    can_view: bool = False
    can_create: bool = False
    can_edit: bool = False
    can_delete: bool = False

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(PermissionBase):
    pass

class PermissionInDBBase(PermissionBase):
    id: int
    role_id: int

    class Config:
        from_attributes = True

class Permission(PermissionInDBBase):
    pass
