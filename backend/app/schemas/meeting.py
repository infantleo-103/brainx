from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class MeetingProvider(str, Enum):
    ZOOM = "zoom"
    GOOGLE_MEET = "gmeet"
    JITSI = "jitsi"

class MeetingGenerateRequest(BaseModel):
    provider: MeetingProvider
    topic: str
    start_time: datetime
    duration_minutes: int = 60
    is_group: bool = False
    record: bool = False
    # Optional list of participant emails to invite
    participants: Optional[List[EmailStr]] = None

class MeetingResponse(BaseModel):
    meeting_url: str
    provider: MeetingProvider
    topic: str
    start_time: datetime
    duration_minutes: int
    is_recorded: bool
    details: Optional[dict] = None # Extra details like meeting ID, password, etc.
