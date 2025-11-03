from utils.logger import get_logger
from core.vectorstore import query_similar
from core.llm_engine import call_gemini
from typing import Dict, Any, List
import datetime

logger = get_logger("workflow_runner")

class WorkflowExecutor:
    def __init__(self):
        self.nodes = []
        self.connections = []
        self.node_results = {}  # Track results for each node
    
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
        
        logger.info(f"✅ Workflow built with {len(nodes)} nodes and {len(edges)} connections")
        return True
    
    def execute_workflow(self, query: str) -> Dict[str, Any]:
        """Execute the workflow with the given query and return results with node outputs"""
        logger.info(f"🚀 Starting workflow execution with query: {query}")
        logger.info(f"📋 Available nodes: {[node.get('type') for node in self.nodes]}")
        logger.info(f"🔗 Available connections: {len(self.connections)}")
        
        # Reset node results for new execution
        self.node_results = {}
        
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
                
            # Process current node and store result
            current_data = self._process_node(current_node, current_data)
            
            # Store node result for frontend display
            self._store_node_result(current_node, current_data)
            
            # Find next node
            next_node_id = self._get_next_node(current_node_id)
            current_node_id = next_node_id
        
        final_output = current_data.get("output", "No output generated")
        
        logger.info(f"🎉 Workflow execution completed successfully")
        
        return {
            "final_output": final_output,
            "node_results": self.node_results
        }
    
    def _store_node_result(self, node: Dict, data: Dict):
        """Store the result of node processing for frontend display"""
        node_id = node["id"]
        node_type = node.get("type")
        
        result_data = {
            "type": node_type,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        if node_type == "userQuery":
            result_data["data"] = data.get("query", "")
        elif node_type == "knowledgeBase":
            result_data["data"] = data.get("context", "")
        elif node_type == "llm":
            result_data["data"] = data.get("output", "")
        elif node_type == "output":
            result_data["data"] = data.get("output", "")
        else:
            result_data["data"] = data.get("output", data.get("query", ""))
        
        self.node_results[node_id] = result_data
        logger.debug(f"📊 Stored result for node {node_id} ({node_type}): {len(str(result_data['data']))} chars")
    
    def _process_node(self, node: Dict, data: Dict) -> Dict:
        node_type = node.get("type")
        node_config = node.get("data", {}).get("config", {})
        
        logger.info(f"🔄 Processing node: {node_type}")
        
        if node_type == "userQuery":
            # User Query node - just pass the query forward
            query_text = data.get("query", "")
            return {"query": query_text, "output": query_text}
            
        elif node_type == "knowledgeBase":
            # Knowledge Base node - retrieve context from documents
            query = data.get("query", "")
            if query:
                logger.info(f"🔍 Querying knowledge base for: {query}")
                similar_docs = query_similar(query, n_results=3)
                context = "\n\n".join([doc["text"] for doc in similar_docs]) if similar_docs else ""
                logger.info(f"📚 Retrieved {len(similar_docs)} relevant chunks from knowledge base")
                return {
                    "query": query, 
                    "context": context, 
                    "output": context
                }
            return data
            
        elif node_type == "llm":
            # LLM node - generate response using Gemini
            query = data.get("query", "")
            context = data.get("context", "")
            
            logger.info(f"🤖 Calling LLM with query: {query[:100]}...")
            logger.info(f"📖 Context length: {len(context)} characters")
            
            # Build the prompt
            prompt = f"""You are a helpful PDF assistant. Use the provided context to answer questions accurately.

CONTEXT:
{context if context else "No context available from the knowledge base."}

USER QUERY:
{query}

Please provide a helpful answer based on the context above. If the context doesn't contain relevant information, please state that clearly."""
            
            # Get LLM configuration from node data
            model = node_config.get("model", "gemini-2.5-flash")
            temperature = node_config.get("temperature", 0.7)
            api_key = node_config.get("apiKey", "")
            
            logger.info(f"🚀 Calling Gemini model: {model}")
            
            # Call the LLM
            try:
                response = call_gemini(
                    prompt=prompt,
                    model=model,
                    temperature=temperature,
                    api_key=api_key
                )
                logger.info(f"✅ LLM response received: {len(response)} characters")
                return {
                    "query": query,
                    "context": context,
                    "output": response
                }
            except Exception as e:
                logger.error(f"❌ LLM call failed: {str(e)}")
                error_response = f"Error calling LLM: {str(e)}"
                return {
                    "query": query,
                    "context": context,
                    "output": error_response
                }
            
        elif node_type == "output":
            # Output node - final result
            output = data.get("output", "No output generated")
            logger.info(f"📤 Final output ready: {output[:200]}...")
            return {"output": output}
        
        return data
    
    def _get_next_node(self, current_node_id: str) -> str:
        """Find the next node in the workflow based on connections"""
        for connection in self.connections:
            if connection.get("source") == current_node_id:
                return connection.get("target")
        return None

def execute_workflow(workflow: dict, query: str) -> Dict[str, Any]:
    """
    Main workflow execution function - returns both final output and node results
    """
    try:
        executor = WorkflowExecutor()
        
        # Extract nodes and edges from workflow
        nodes = workflow.get("nodes", [])
        edges = workflow.get("edges", [])
        
        logger.info(f"🏗️ Starting workflow execution with {len(nodes)} nodes and {len(edges)} edges")
        
        # Build workflow
        executor.build_workflow(nodes, edges)
        
        # Execute workflow and get results
        result = executor.execute_workflow(query)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Workflow execution failed: {str(e)}")
        raise e