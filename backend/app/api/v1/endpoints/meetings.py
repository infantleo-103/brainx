from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from app.api import deps
from app.schemas.meeting import MeetingGenerateRequest, MeetingResponse
from app.services.meeting_service import meeting_service
from app.models.user import User

router = APIRouter()

@router.post("/generate-link", response_model=MeetingResponse)
async def generate_meeting_link(
    *,
    request: MeetingGenerateRequest,
    # current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Generate a meeting link for Zoom, Google Meet, or Jitsi.
    requires: teacher, coordinator, or admin role.
    """
    # if current_user.role not in ["admin", "coordinator", "teacher", "instructor"]:
    #      raise HTTPException(status_code=403, detail="Not authorized to generate meeting links")

    try:
        response = await meeting_service.generate_meeting(request)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log generic error
        print(f"Error generating meeting: {e}")
        raise HTTPException(status_code=500, detail="Internal server error generating meeting link")
