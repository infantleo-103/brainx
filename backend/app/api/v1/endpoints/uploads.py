from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import Any

from app.services.storage_service import storage_service
from app.schemas.response import APIResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/profile-image", response_model=APIResponse[str])
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Upload a profile image to storage and return the URL.
    Does NOT update the user profile in DB automatically (as per request).
    """
    
    # Validate file type if needed (e.g., only images)
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    # Upload to storage
    # We can use a folder structure like 'profile-images/{user_id}'
    folder = f"profile-images/{str(current_user.id)}"
    
    public_url = await storage_service.upload_file(file, path=folder)
    
    return APIResponse(
        status_code=200,
        message="Image uploaded successfully",
        data=public_url
    )
