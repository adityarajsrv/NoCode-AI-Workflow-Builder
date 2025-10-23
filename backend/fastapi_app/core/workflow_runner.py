from utils.logger import get_logger
from core.vectorstore import query_similar
from core.embeddings import embed_texts
from core.llm_engine import call_gemini, web_search

logger = get_logger("workflow_runner")

def execute_workflow(workflow: dict, query: str):
    """
    Minimal orchestration:
      - If workflow contains KnowledgeBase node: query the vector store for context
      - If workflow contains LLM node: call LLM with prompt that includes context
      - Return the LLM response or plain fallback
    workflow is expected to be a dict with "nodes" (list of nodes)
    """
    logger.info("Running workflow")
    nodes = workflow.get("nodes", [])
    has_kb = any(n.get("type","").lower().startswith("knowledge") for n in nodes)
    has_llm = any(n.get("type","").lower().startswith("llm") for n in nodes)

    context = ""
    if has_kb:
        logger.info("KnowledgeBase node present — retrieving context from vectorstore")
        sims = query_similar(query, n_results=3)
        context = "\n\n".join([s["text"] for s in sims]) if sims else ""
    else:
        logger.info("No KnowledgeBase node in workflow")

    if any(n.get("config", {}).get("useWeb", False) for n in nodes):
        logger.info("Web search requested by LLM node; fetching")
        web_hits = web_search(query)
        if web_hits:
            snippets = []
            for hit in web_hits[:3]:
                snippet = hit.get("snippet") or hit.get("title") or str(hit)
                snippets.append(snippet)
            context += "\n\n[WEB]\n" + "\n".join(snippets)

    if not has_llm:
        logger.warning("No LLM node found — returning context or echo")
        return context or "No LLM node configured and no context found."

    prompt = f"""You are a helpful assistant.
User Query:
{query}

Context:
{context if context else 'No document context available.'}

Answer succinctly and reference the context where applicable.
"""
    answer = call_gemini(prompt)
    return answer
