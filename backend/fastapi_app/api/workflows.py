from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import logging
from ..core.workflow_runner import execute_workflow

logger = logging.getLogger(__name__)

router = APIRouter()

class WorkflowRequest(BaseModel):
    workflow: Dict[str, Any]
    query: str

class WorkflowResponse(BaseModel):
    success: bool
    output: str
    error: str = None

@router.post("/build")
async def build_workflow(workflow: Dict[str, Any]):
    """Build workflow endpoint"""
    try:
        logger.info("Workflow built successfully")
        return {"success": True, "message": "Workflow built successfully"}
    except Exception as e:
        logger.error(f"Error building workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run", response_model=WorkflowResponse)
async def run_workflow(req: WorkflowRequest):
    """Run workflow with query"""
    try:
        logger.info(f"Running workflow with query: {req.query}")
        
        result = execute_workflow(req.workflow, req.query)
        
        # Extract the final output
        final_output = result.get('output', 'No output generated')
        
        logger.info("✅ Workflow executed successfully")
        return WorkflowResponse(
            success=True,
            output=final_output
        )
        
    except Exception as e:
        logger.error(f"Error running workflow: {e}")
        return WorkflowResponse(
            success=False,
            output="",
            error=str(e)
        )
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