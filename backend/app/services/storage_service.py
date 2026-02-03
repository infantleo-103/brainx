import aiohttp
from fastapi import UploadFile, HTTPException
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.api_key = settings.BUNNY_API_KEY
        self.storage_zone = settings.BUNNY_STORAGE_ZONE
        self.region = settings.BUNNY_REGION  # e.g., 'de', 'ny', 'sg' or generic
        
        # Base URL construction based on region if needed, 
        # but standard is usually storage.bunnycdn.com for main region
        # If region is 'de' (default) -> storage.bunnycdn.com
        # If others, might need prefix. Let's assume standard for now or check docs.
        # However, for simplicity and common usage:
        self.base_url = f"https://storage.bunnycdn.com/{self.storage_zone}"
        self.pull_zone_url = f"https://{self.storage_zone}.b-cdn.net" # Assuming standard pull zone naming

    async def upload_file(self, file: UploadFile, path: str = "") -> str:
        """
        Upload a file to Bunny.net storage.
        Returns the public URL of the uploaded file.
        """
        try:
            content = await file.read()
            filename = file.filename
            
            # Construct upload URL
            # Format: https://storage.bunnycdn.com/{storageZoneName}/{path}/{filename}
            target_path = f"{path}/{filename}" if path else filename
            # Remove leading slash if present in path to avoid double slashes issues
            if target_path.startswith("/"):
                target_path = target_path[1:]
                
            url = f"{self.base_url}/{target_path}"
            
            headers = {
                "AccessKey": self.api_key,
                "Content-Type": "application/octet-stream", # Generic binary
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.put(url, data=content, headers=headers) as response:
                    if response.status != 201:
                        response_text = await response.text()
                        print(f"Failed to upload to Bunny.net: {response.status} - {response_text}")
                        raise HTTPException(status_code=500, detail="Failed to upload image")
                    
            # Return public URL
            # Format: https://{pullZoneUrl}/{path}/{filename}
            public_url = f"{self.pull_zone_url}/{target_path}"
            return public_url
            
        except Exception as e:
            print(f"Error uploading file: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            await file.seek(0) # Reset file pointer if needed elsewhere

storage_service = StorageService()
