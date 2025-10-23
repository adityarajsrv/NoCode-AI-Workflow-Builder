from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.workflow_runner import execute_workflow
from utils.logger import get_logger

router = APIRouter()
logger = get_logger("api.workflows")

class RunRequest(BaseModel):
    workflow: dict
    query: str

@router.post("/run")
def run_workflow(req: RunRequest):
    try:
        result = execute_workflow(req.workflow, req.query)
        return {"response": result}
    except Exception as e:
        logger.exception("Error running workflow")
        raise HTTPException(status_code=500, detail=str(e))
