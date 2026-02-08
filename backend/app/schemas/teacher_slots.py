from datetime import time, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, model_validator


class TeacherAvailabilityBase(BaseModel):
    """Base schema for teacher availability"""
    weekday_available: bool = False
    weekday_start: Optional[time] = None
    weekday_end: Optional[time] = None
    weekend_available: bool = False
    weekend_start: Optional[time] = None
    weekend_end: Optional[time] = None


class TeacherAvailabilityCreate(TeacherAvailabilityBase):
    """Schema for creating teacher availability"""
    teacher_id: UUID
    
    @model_validator(mode='after')
    def validate_times(self):
        # Validate weekday times
        if self.weekday_available:
            if not self.weekday_start or not self.weekday_end:
                raise ValueError('weekday_start and weekday_end are required when weekday_available is True')
            if self.weekday_end <= self.weekday_start:
                raise ValueError('weekday_end must be after weekday_start')
        
        # Validate weekend times
        if self.weekend_available:
            if not self.weekend_start or not self.weekend_end:
                raise ValueError('weekend_start and weekend_end are required when weekend_available is True')
            if self.weekend_end <= self.weekend_start:
                raise ValueError('weekend_end must be after weekend_start')
        
        return self


class TeacherAvailabilityUpdate(TeacherAvailabilityBase):
    """Schema for updating teacher availability - inherits from Base for validation"""
    weekday_available: bool = False
    weekday_start: Optional[time] = None
    weekday_end: Optional[time] = None
    weekend_available: bool = False
    weekend_start: Optional[time] = None
    weekend_end: Optional[time] = None
    
    @model_validator(mode='after')
    def validate_times(self):
        # Validate weekday times
        if self.weekday_available:
            if not self.weekday_start or not self.weekday_end:
                raise ValueError('weekday_start and weekday_end are required when weekday_available is True')
            if self.weekday_end <= self.weekday_start:
                raise ValueError('weekday_end must be after weekday_start')
        
        # Validate weekend times
        if self.weekend_available:
            if not self.weekend_start or not self.weekend_end:
                raise ValueError('weekend_start and weekend_end are required when weekend_available is True')
            if self.weekend_end <= self.weekend_start:
                raise ValueError('weekend_end must be after weekend_start')
        
        return self


class TeacherAvailability(TeacherAvailabilityBase):
    """Response schema for teacher availability"""
    id: UUID
    teacher_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
