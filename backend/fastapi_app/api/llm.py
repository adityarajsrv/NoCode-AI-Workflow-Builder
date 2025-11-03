from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.llm_engine import call_gemini, web_search
from utils.logger import get_logger

router = APIRouter()
logger = get_logger("api.llm")

class LLMRequest(BaseModel):
    message: str | None = None
    prompt: str | None = None
    context: str | None = None
    temperature: float = 0.7
    api_key: str | None = None
    model: str = "gemini-2.5-flash"  # Updated to official stable model
    use_websearch: bool = False
    serp_api_key: str | None = None

@router.post("/")
def chat_with_llm(req: LLMRequest):
    try:
        logger.info(f"Received LLM request for model: {req.model}")
        
        # Use provided API key or environment key
        effective_api_key = req.api_key or settings.GEMINI_API_KEY
        if not effective_api_key:
            raise HTTPException(status_code=400, detail="No Gemini API key provided")
        
        # Build the final prompt
        final_prompt = ""
        if req.prompt:
            final_prompt = req.prompt
        else:
            # Build default prompt structure
            final_prompt = f"Context:\n{req.context or 'No context provided'}\n\nQuestion:\n{req.message or 'No question provided'}\n\nAnswer:"
        
        # Add web search results if enabled
        web_context = ""
        if req.use_websearch:
            logger.info("Web search enabled, fetching results")
            web_results = web_search(req.message or "", req.serp_api_key)
            if web_results:
                web_context = "\n".join([result.get("snippet", "") for result in web_results[:2]])
                final_prompt += f"\n\nAdditional Web Context:\n{web_context}"
        
        # Call Gemini with the specified model
        response = call_gemini(
            prompt=final_prompt,
            model=req.model,
            temperature=req.temperature
        )
        
        return {
            "status": "success",
            "reply": response,
            "model_used": req.model,
            "web_search_used": bool(web_context)
        }
        
    except Exception as e:
        logger.error(f"LLM API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {str(e)}")
    