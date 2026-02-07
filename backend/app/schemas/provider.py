from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict

class ProviderBase(BaseModel):
    name: str
    logo_url: Optional[str] = ""
    description: Optional[str] = ""
    status: bool = True
    css_class_name: Optional[str] = ""

class ProviderCreate(ProviderBase):
    pass

class ProviderUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    status: Optional[bool] = None

from uuid import UUID

class Provider(ProviderBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @staticmethod
    def _validate_none_to_string(v: Any) -> Any:
        if v is None:
            return ""
        return v

    @staticmethod
    def _validate_none_to_bool(v: Any) -> bool:
        if v is None:
            return False  # Default to False if None
        return v

    from pydantic import field_validator

    @field_validator('logo_url', 'description', 'css_class_name', mode='before')
    @classmethod
    def set_null_to_string(cls, v: Optional[str]) -> str:
        return cls._validate_none_to_string(v)

    @field_validator('status', mode='before')
    @classmethod
    def set_null_to_bool(cls, v: Optional[bool]) -> bool:
        return cls._validate_none_to_bool(v)
