from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.llm_engine import call_gemini, web_search
from utils.logger import get_logger
import os

router = APIRouter()
logger = get_logger("api.llm")

class LLMRequest(BaseModel):
    message: str | None = None
    prompt: str | None = None
    context: str | None = None
    temperature: float = 0.7
    api_key: str | None = None
    model: str = "gemini-2.5-flash"
    use_websearch: bool = False
    serp_api_key: str | None = None

@router.post("/")
def chat_with_llm(req: LLMRequest):
    try:
        logger.info(f"Received LLM request for model: {req.model}")
        logger.info(f"Web search enabled: {req.use_websearch}")
        
        # Use provided API key or environment key
        effective_api_key = req.api_key or os.getenv("GEMINI_API_KEY")
        if not effective_api_key:
            raise HTTPException(status_code=400, detail="No Gemini API key provided. Please provide an API key or set GEMINI_API_KEY environment variable.")
        
        # Build the final prompt
        final_prompt = ""
        if req.prompt:
            final_prompt = req.prompt
        else:
            # Build default prompt structure
            base_context = req.context or "No context provided from documents."
            final_prompt = f"""You are a helpful AI assistant. Use the provided context to answer questions accurately.

CONTEXT FROM DOCUMENTS:
{base_context}

USER QUESTION:
{req.message or 'No question provided'}

Please provide a helpful answer based on the context above. If the context doesn't contain relevant information, please state that clearly."""
        
        # Add web search results if enabled
        web_context = ""
        web_search_used = False
        
        if req.use_websearch:
            logger.info("Web search enabled, fetching results")
            
            # Use provided SerpAPI key or environment key
            serp_api_key = req.serp_api_key or os.getenv("SERPAPI_KEY")
            
            if not serp_api_key:
                logger.warning("Web search enabled but no SerpAPI key provided")
                web_context = "\n\nNote: Web search was enabled but no SerpAPI key was provided. Please add your SerpAPI key to enable web search functionality."
            else:
                try:
                    search_query = req.message or "current events and general knowledge"
                    web_results = web_search(search_query, serp_api_key)
                    
                    if web_results:
                        web_search_used = True
                        web_context = "\n\nADDITIONAL INFORMATION FROM WEB SEARCH:\n"
                        web_context += "\n".join([f"• {result.get('snippet', 'No snippet available')}" 
                                                for result in web_results[:3]])  # Get top 3 results
                        
                        # Add the web context to the final prompt
                        final_prompt += web_context
                        
                        logger.info(f"✅ Web search successful, found {len(web_results)} results")
                    else:
                        web_context = "\n\nNote: Web search was performed but no relevant results were found."
                        final_prompt += web_context
                        
                except Exception as web_error:
                    logger.error(f"Web search failed: {str(web_error)}")
                    web_context = f"\n\nNote: Web search encountered an error: {str(web_error)}"
                    final_prompt += web_context
        
        # Log the final prompt (truncated for logs)
        logger.info(f"Final prompt length: {len(final_prompt)} characters")
        logger.debug(f"Final prompt: {final_prompt[:500]}...")
        
        # Call Gemini with the specified model and API key
        response = call_gemini(
            prompt=final_prompt,
            model=req.model,
            temperature=req.temperature,
            api_key=effective_api_key  # Pass the API key to the function
        )
        
        return {
            "status": "success",
            "reply": response,
            "model_used": req.model,
            "web_search_used": web_search_used,
            "prompt_length": len(final_prompt)
        }
        
    except Exception as e:
        logger.error(f"LLM API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {str(e)}")

@router.get("/health")
def health_check():
    """Health check endpoint for LLM service"""
    return {
        "status": "healthy",
        "service": "LLM API",
        "available_models": ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"]
    }