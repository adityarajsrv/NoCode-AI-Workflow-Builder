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
        
        # Validate workflow
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
def run_workflow(req: RunRequest):
    """
    Execute workflow with user query
    """
    try:
        logger.info(f"Running workflow with query: {req.query}")
        
        result = execute_workflow(req.workflow, req.query)
        
        return {
            "status": "success",
            "response": result,
            "query": req.query
        }
        
    except Exception as e:
        logger.exception("Error running workflow")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/validate/{workflow_id}")
def validate_workflow(workflow_id: str):
    """
    Validate a saved workflow
    """
    # This would typically load from database
    # For now, return basic validation
    return {
        "workflow_id": workflow_id,
        "valid": True,
        "message": "Workflow validation endpoint"
    }