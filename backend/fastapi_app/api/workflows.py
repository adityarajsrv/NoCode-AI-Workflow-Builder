from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.workflow_runner import execute_workflow
from utils.logger import get_logger

router = APIRouter()
logger = get_logger("api.workflows")

class RunRequest(BaseModel):
    workflow: dict
    query: str

class BuildRequest(BaseModel):
    workflow: dict

@router.post("/build")
def build_workflow(req: BuildRequest):
    """
    Validate and build workflow without executing
    """
    try:
        from core.workflow_runner import WorkflowExecutor
        
        executor = WorkflowExecutor()
        nodes = req.workflow.get("nodes", [])
        edges = req.workflow.get("edges", [])
        
        executor.build_workflow(nodes, edges)
        
        return {
            "status": "success", 
            "message": "Workflow built successfully",
            "node_count": len(nodes),
            "edge_count": len(edges)
        }
        
    except Exception as e:
        logger.error(f"Workflow build failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/run")
async def run_workflow(request: dict):
    """
    Run workflow and return both final output and node results
    """
    try:
        workflow_data = request.get("workflow", {})
        query = request.get("query", "")
        session_id = request.get("session_id", "default")  
        
        if not workflow_data:
            raise HTTPException(status_code=400, detail="Workflow data is required")
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        logger.info(f"🚀 Running workflow with query: {query}, session: {session_id}")
        
        result = execute_workflow(workflow_data, query, session_id)
        
        return {
            "success": True,
            "final_output": result["final_output"],
            "node_results": result["node_results"],
            "session_id": session_id
        }
        
    except Exception as e:
        logger.error(f"Workflow execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/validate/{workflow_id}")
def validate_workflow(workflow_id: str):
    """
    Validate a saved workflow
    """
    return {
        "workflow_id": workflow_id,
        "valid": True,
        "message": "Workflow validation endpoint"
    }