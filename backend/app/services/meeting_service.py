import uuid
from datetime import datetime
from typing import Optional
from app.schemas.meeting import MeetingGenerateRequest, MeetingResponse, MeetingProvider
from app.core.config import settings

class MeetingService:
    @staticmethod
    async def generate_meeting(request: MeetingGenerateRequest) -> MeetingResponse:
        if request.provider == MeetingProvider.JITSI:
            return await MeetingService._generate_jitsi_link(request)
        elif request.provider == MeetingProvider.ZOOM:
            return await MeetingService._generate_zoom_link(request)
        elif request.provider == MeetingProvider.GOOGLE_MEET:
            return await MeetingService._generate_gmeet_link(request)
        else:
            raise ValueError(f"Unsupported provider: {request.provider}")

    @staticmethod
    async def _generate_jitsi_link(request: MeetingGenerateRequest) -> MeetingResponse:
        # Jitsi allows creating meetings by just generating a unique URL
        # We can use the topic (sanitized) or a UUID
        room_name = f"{request.topic.replace(' ', '_')}_{uuid.uuid4().hex[:8]}"
        base_url = "https://meet.jit.si"
        meeting_url = f"{base_url}/{room_name}"
        
        # Jitsi config params for recording/startup
        # Note: Jitsi SaaS/Self-hosted config usually handles recording storage, 
        # but we can pass config params in URL hash for client-side behavior if supported
        # largely depends on Jitsi deployment.
        
        return MeetingResponse(
            meeting_url=meeting_url,
            provider=MeetingProvider.JITSI,
            topic=request.topic,
            start_time=request.start_time,
            duration_minutes=request.duration_minutes,
            is_recorded=request.record,
            details={"room_name": room_name}
        )

    @staticmethod
    async def _generate_zoom_link(request: MeetingGenerateRequest) -> MeetingResponse:
        # Check for Zoom credentials in settings
        if not settings.ZOOM_API_KEY or not settings.ZOOM_API_SECRET:
             print("Warning: ZOOM_API_KEY or ZOOM_API_SECRET not set. Using mock generation.")
        
        # In a real implementation, usage would look like:
        # headers = {"Authorization": f"Bearer {jwt_token}"}
        # payload = { "topic": request.topic, "type": 2, "start_time": ..., "settings": { "auto_recording": "cloud" if request.record else "none" } }
        # resp = requests.post(f"https://api.zoom.us/v2/users/{settings.ZOOM_ACCOUNT_ID}/meetings", headers=headers, json=payload)

        # Mocking a generated Zoom link
        meeting_id = str(uuid.uuid4().int)[:10]
        meeting_url = f"https://zoom.us/j/{meeting_id}"
        
        # Construct response
        details = {
            "meeting_id": meeting_id,
            "password": "mock_password",
            "host_email": "mock_host@example.com"
        }
        
        if request.record:
            details["auto_recording"] = "cloud"

        return MeetingResponse(
            meeting_url=meeting_url,
            provider=MeetingProvider.ZOOM,
            topic=request.topic,
            start_time=request.start_time,
            duration_minutes=request.duration_minutes,
            is_recorded=request.record,
            details=details
        )

    @staticmethod
    async def _generate_gmeet_link(request: MeetingGenerateRequest) -> MeetingResponse:
        # Google Meet links are usually generated via Google Calendar API events.insert
        # Mocking for now
        
        meet_code = f"{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:4]}-{uuid.uuid4().hex[:3]}"
        meeting_url = f"https://meet.google.com/{meet_code}"
        
        return MeetingResponse(
            meeting_url=meeting_url,
            provider=MeetingProvider.GOOGLE_MEET,
            topic=request.topic,
            start_time=request.start_time,
            duration_minutes=request.duration_minutes,
            is_recorded=request.record,
            details={"meet_code": meet_code}
        )

meeting_service = MeetingService()
