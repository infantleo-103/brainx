from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    status_code: int
    message: str = ""
    access_token: Optional[str] = None
    data: Optional[T] = None
