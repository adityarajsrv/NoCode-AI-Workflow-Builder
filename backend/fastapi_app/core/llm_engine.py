import google.generativeai as genai
import requests
from utils.config import settings
from utils.logger import get_logger

logger = get_logger("llm_engine")
genai.configure(api_key=settings.GEMINI_API_KEY)

def call_gemini(prompt: str, model: str = "gemini-2.5-flash", max_tokens: int = 512):
    """
    Send prompt to Gemini and return text. Adjust call if API differs.
    """
    logger.info("Calling Gemini LLM")
    try:
        model_client = genai.GenerativeModel(model)
        response = model_client.generate_content(prompt)
        text = response.text if hasattr(response, "text") else response.get("output", "")
    except Exception as e:
        res = genai.generate(model=model, prompt=prompt, max_output_tokens=max_tokens)
        text = res.get("candidates", [{}])[0].get("content", "")
    logger.info("Received response from Gemini")
    return text

def web_search(query: str):
    if not settings.SERPAPI_KEY:
        logger.info("SERPAPI_KEY not configured — skipping web search")
        return []
    logger.info("Calling SerpAPI for web search")
    params = {"q": query, "api_key": settings.SERPAPI_KEY}
    resp = requests.get("https://serpapi.com/search.json", params=params, timeout=10)
    if resp.status_code != 200:
        logger.warning(f"SerpAPI returned {resp.status_code}")
        return []
    data = resp.json()
    results = data.get("organic_results") or data.get("news_results") or []
    return results
