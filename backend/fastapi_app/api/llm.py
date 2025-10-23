from fastapi import APIRouter
from pydantic import BaseModel
from core.llm_engine import call_gemini
from utils.logger import get_logger

router = APIRouter()
logger = get_logger("api.chat")

class ChatReq(BaseModel):
    message: str
    context: str | None = None

@router.post("/")
def chat(req: ChatReq):
    prompt = f"Context:\n{req.context or 'None'}\n\nQuestion:\n{req.message}"
    resp = call_gemini(prompt)
    return {"reply": resp}
