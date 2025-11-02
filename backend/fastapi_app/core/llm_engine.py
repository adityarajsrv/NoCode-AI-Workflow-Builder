import google.generativeai as genai
import requests
from utils.config import settings
from utils.logger import get_logger

logger = get_logger("llm_engine")

def call_gemini(prompt: str, model: str = "gemini-2.5-flash", temperature: float = 0.7, max_tokens: int = 1024, api_key: str = None):
    """
    Gemini call with API key support from request
    """
    logger.info(f"Calling Gemini LLM with model {model}, temperature {temperature}")
    
    try:
        # Use provided API key or environment key
        effective_api_key = api_key or settings.GEMINI_API_KEY
        if not effective_api_key:
            raise ValueError("No Gemini API key provided")
        
        # Configure with the effective API key
        genai.configure(api_key=effective_api_key)
        
        # Official Gemini model names
        supported_models = [
            'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite',
            'gemini-2.0-flash', 'gemini-2.0-flash-lite',
            'gemini-flash-latest', 'gemini-pro-latest',
            'gemini-1.5-flash', 'gemini-1.5-pro'
        ]
        
        # Validate and use the requested model
        if model in supported_models:
            model_name = model
        else:
            model_name = "gemini-2.5-flash"
            logger.warning(f"Model {model} not recognized, using {model_name} instead")
        
        logger.info(f"Using Gemini model: {model_name}")
        
        # Initialize the model
        model_client = genai.GenerativeModel(model_name)
        
        # Configure generation parameters
        generation_config = {
            "temperature": temperature,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": max_tokens,
        }
        
        # Generate content
        response = model_client.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        # Extract text from response
        if hasattr(response, 'text'):
            text = response.text
        elif hasattr(response, 'result'):
            text = response.result
        else:
            text = str(response)
            
        logger.info(f"Successfully received response from {model_name}")
        return text.strip()
        
    except Exception as e:
        logger.error(f"Gemini API call failed with model {model}: {str(e)}")
        
        # Fallback strategy
        try:
            logger.info("Trying fallback with gemini-1.5-flash")
            fallback_model = genai.GenerativeModel("gemini-1.5-flash")
            response = fallback_model.generate_content(prompt)
            return response.text.strip()
        except Exception as fallback_error:
            logger.error(f"Gemini fallback also failed: {str(fallback_error)}")
            return f"Error calling LLM: {str(e)}"

def web_search(query: str, api_key: str = None):
    """
    Web search function - currently not used in workflow but kept for compatibility
    """
    search_key = api_key or settings.SERPAPI_KEY
    if not search_key:
        logger.info("No SerpAPI key configured — skipping web search")
        return []
    
    logger.info(f"Performing web search for: {query}")
    
    try:
        params = {
            "q": query,
            "api_key": search_key,
            "engine": "google"
        }
        
        resp = requests.get("https://serpapi.com/search.json", params=params, timeout=15)
        if resp.status_code != 200:
            logger.warning(f"SerpAPI returned status {resp.status_code}: {resp.text}")
            return []
            
        data = resp.json()
        results = data.get("organic_results", [])
        
        logger.info(f"Web search returned {len(results)} results")
        return results[:3]
        
    except Exception as e:
        logger.error(f"Web search failed: {str(e)}")
        return []