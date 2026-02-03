from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/")
def read_items(current_user: User = Depends(get_current_user)):
    return [{"item_id": "Foo"}, {"item_id": "Bar"}]
