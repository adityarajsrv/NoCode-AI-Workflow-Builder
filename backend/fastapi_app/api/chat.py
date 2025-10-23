from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_chat_status():
    return {"status": "chat API working"}
