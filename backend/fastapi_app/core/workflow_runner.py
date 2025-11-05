from utils.logger import get_logger
from core.vectorstore import query_similar
from core.llm_engine import call_gemini
from typing import Dict, Any, List
import datetime
import requests
import os

logger = get_logger("workflow_runner")

# Simple conversation memory implementation
class ConversationMemory:
    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.conversations = {}
    
    def add_message(self, session_id: str, role: str, content: str):
        if session_id not in self.conversations:
            self.conversations[session_id] = []
        
        self.conversations[session_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        # Keep only recent history
        if len(self.conversations[session_id]) > self.max_history:
            self.conversations[session_id] = self.conversations[session_id][-self.max_history:]
    
    def get_conversation_history(self, session_id: str) -> List[Dict]:
        return self.conversations.get(session_id, [])
    
    def get_context_summary(self, session_id: str) -> str:
        history = self.get_conversation_history(session_id)
        if not history:
            return "No previous conversation context."
        
        # Create a summary of recent conversation
        context_lines = ["Previous conversation context:"]
        for msg in history[-4:]:  # Last 2 exchanges
            role = "User" if msg["role"] == "user" else "Assistant"
            context_lines.append(f"{role}: {msg['content'][:100]}{'...' if len(msg['content']) > 100 else ''}")
        
        return "\n".join(context_lines)

# Global conversation memory instance
conversation_memory = ConversationMemory()

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
    
    def execute_workflow(self, query: str, session_id: str = "default") -> Dict[str, Any]:
        """Execute the workflow with the given query and return results with node outputs"""
        logger.info(f"🚀 Starting workflow execution with query: {query}")

        # Add to conversation memory
        conversation_memory.add_message(session_id, "user", query)

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
            current_data = self._process_node(current_node, current_data, session_id)
            
            # Store node result for frontend display
            self._store_node_result(current_node, current_data)
            
            # Find next node
            next_node_id = self._get_next_node(current_node_id)
            current_node_id = next_node_id
        
        final_output = current_data.get("output", "No output generated")
        
        # Add assistant response to conversation memory
        conversation_memory.add_message(session_id, "assistant", final_output)
        
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
    
    def _process_node(self, node: Dict, data: Dict, session_id: str = "default") -> Dict:
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
            
        # In workflow_runner.py - update the LLM processing section
        elif node_type == "llm":
            # LLM node - generate response using Gemini
            query = data.get("query", "")
            context = data.get("context", "")
            
            logger.info(f"🤖 Calling LLM with query: {query[:100]}...")
            logger.info(f"📖 Context length: {len(context)} characters")
            
            # Get LLM configuration from node data
            node_data = node.get("data", {})
            node_config = node_data.get("config", {})
            
            model = node_config.get("model", "gemini-2.5-flash")
            temperature = node_config.get("temperature", 0.7)
            api_key = node_config.get("apiKey", "")
            use_websearch = node_config.get("useWebSearch", False)
            serp_api_key = node_config.get("serpApiKey", "")
            
            logger.info(f"🔧 LLM Config - Model: {model}, WebSearch: {use_websearch}")
            
            # Get conversation context
            conversation_context = conversation_memory.get_context_summary(session_id)
            
            # Build the prompt
            prompt = f"""You are an expert AI assistant with access to document context and optional web search.

        CONVERSATION HISTORY:
        {conversation_context}

        DOCUMENT CONTEXT:
        {context if context else "No specific context available from uploaded documents."}

        USER QUESTION:
        {query}

        INSTRUCTIONS:
        1. First, analyze if the document context contains relevant information
        2. If the context is relevant, provide a comprehensive answer based on it
        3. If the context is insufficient or irrelevant, use general knowledge
        4. Always be accurate, helpful, and detailed
        5. Structure your response clearly with proper formatting when helpful
        6. If referring to specific sections from documents, mention that explicitly

        Please provide a well-structured, informative response:"""
            
            logger.info(f"🚀 Calling Gemini model: {model}")
            
            # Call the LLM directly instead of through API to avoid timeout
            try:
                # Use direct function call to avoid API timeout issues
                response = call_gemini(
                    prompt=prompt,
                    model=model,
                    temperature=temperature,
                    api_key=api_key
                )
                
                logger.info(f"✅ LLM response received: {len(response)} characters")
                logger.info(f"🌐 Web search would be used: {use_websearch}")
                
            except Exception as e:
                logger.error(f"❌ LLM call failed: {str(e)}")
                response = f"Error calling LLM: {str(e)}"
            
            return {
                "query": query,
                "context": context,
                "output": response
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

def execute_workflow(workflow: dict, query: str, session_id: str = "default") -> Dict[str, Any]:
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
        result = executor.execute_workflow(query, session_id)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Workflow execution failed: {str(e)}")
        raise e