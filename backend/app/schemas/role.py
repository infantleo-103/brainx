from typing import Optional, List
from pydantic import BaseModel
from .permission import Permission

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    pass

from uuid import UUID

class RoleInDBBase(RoleBase):
    id: UUID
    permissions: List[Permission] = []

    class Config:
        from_attributes = True

class Role(RoleInDBBase):
    pass

# Additional schema for Role with user count
class RoleWithCount(Role):
    user_count: int = 0
