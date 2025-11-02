from utils.logger import get_logger
from core.vectorstore import query_similar
from core.embeddings import embed_texts
from core.llm_engine import call_gemini, web_search
from typing import Dict, Any, List

logger = get_logger("workflow_runner")

class WorkflowExecutor:
    def __init__(self):
        self.nodes = []
        self.connections = []
    
    def build_workflow(self, nodes: List[Dict], edges: List[Dict]):
        """Build and validate workflow structure"""
        self.nodes = nodes
        self.connections = edges
        
        # Validate workflow has required components
        has_user_query = any(node.get("type") == "userQuery" for node in nodes)
        has_output = any(node.get("type") == "output" for node in nodes)
        
        if not has_user_query:
            raise ValueError("Workflow must contain a User Query component")
        if not has_output:
            raise ValueError("Workflow must contain an Output component")
        
        logger.info(f"Workflow built with {len(nodes)} nodes and {len(edges)} connections")
        return True
    
    def execute_workflow(self, query: str) -> str:
        """Execute the workflow with the given query"""
        logger.info(f"Executing workflow with query: {query}")
        
        # Find start node (User Query)
        user_query_node = next((node for node in self.nodes if node.get("type") == "userQuery"), None)
        if not user_query_node:
            raise ValueError("No User Query node found in workflow")
        
        # Process workflow step by step
        current_data = {"query": query}
        current_node_id = user_query_node["id"]
        
        visited_nodes = set()
        
        while current_node_id and current_node_id not in visited_nodes:
            visited_nodes.add(current_node_id)
            current_node = next((node for node in self.nodes if node["id"] == current_node_id), None)
            
            if not current_node:
                break
                
            # Process current node
            current_data = self._process_node(current_node, current_data)
            
            # Find next node
            next_node_id = self._get_next_node(current_node_id)
            current_node_id = next_node_id
        
        return current_data.get("output", "No output generated")
    
    def _process_node(self, node: Dict, data: Dict) -> Dict:
        node_type = node.get("type")
        node_config = node.get("config", {})
        
        logger.info(f"Processing node: {node_type} with data: {data.keys()}")
        
        if node_type == "userQuery":
            return {"query": data.get("query", ""), "output": data.get("query", "")}
            
        elif node_type == "knowledgeBase":
            query = data.get("query", "")
            if query:
                similar_docs = query_similar(query, n_results=3)
                context = "\n\n".join([doc["text"] for doc in similar_docs]) if similar_docs else ""
                return {
                    "query": query, 
                    "context": context, 
                    "output": context
                }
            return data
            
        elif node_type == "llm":
            query = data.get("query", "")
            context = data.get("context", "")
            
            # Prepare inputs for LLM node
            llm_inputs = {
                "query": query,
                "context": context
            }
            
            return {
                "query": query,
                "context": context,
                "inputs": llm_inputs,
                "output": "LLM processing triggered"
            }
            
        elif node_type == "output":
            output = data.get("output", "No output generated")
            return {"output": output}
        
        return data
    
    def _get_next_node(self, current_node_id: str) -> str:
        """Find the next node in the workflow based on connections"""
        for connection in self.connections:
            if connection.get("source") == current_node_id:
                return connection.get("target")
        return None

def execute_workflow(workflow: dict, query: str):
    """
    Main workflow execution function
    """
    try:
        executor = WorkflowExecutor()
        
        # Extract nodes and edges from workflow
        nodes = workflow.get("nodes", [])
        edges = workflow.get("edges", [])
        
        # Build workflow
        executor.build_workflow(nodes, edges)
        
        # Execute workflow
        result = executor.execute_workflow(query)
        return result
        
    except Exception as e:
        logger.error(f"Workflow execution failed: {str(e)}")
        raise e