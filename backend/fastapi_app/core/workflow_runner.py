import logging
from typing import Dict, Any, List
from .vectorstore import query_similar
from .llm_engine import call_gemini, web_search

logger = logging.getLogger(__name__)

class WorkflowExecutor:
    def __init__(self, workflow_data: Dict[str, Any]):
        self.workflow_data = workflow_data
        self.nodes = workflow_data.get('nodes', [])
        self.connections = workflow_data.get('connections', [])
        
    def execute_workflow(self, query: str) -> Dict[str, Any]:
        """Execute the workflow with the given query"""
        try:
            logger.info(f"🏗️ Starting workflow execution with {len(self.nodes)} nodes and {len(self.connections)} edges")
            logger.info(f"Executing workflow with query: {query}")
            
            # Find start node (userQuery)
            start_node = next((node for node in self.nodes if node.get('type') == 'userQuery'), None)
            if not start_node:
                raise ValueError("No userQuery node found in workflow")
            
            # Initialize with query data
            current_data = {
                'query': query,
                'output': query  # Initial output is the query itself
            }
            current_node_id = start_node['id']
            
            processed_nodes = set()
            
            while current_node_id and current_node_id not in processed_nodes:
                processed_nodes.add(current_node_id)
                current_node = next((node for node in self.nodes if node['id'] == current_node_id), None)
                
                if not current_node:
                    break
                    
                logger.info(f"Processing node: {current_node.get('type')} with data: {current_data.keys()}")
                
                # Process current node
                current_data = self._process_node(current_node, current_data)
                
                # Find next node
                current_node_id = self._get_next_node(current_node_id)
            
            logger.info("✅ Workflow execution completed successfully")
            return current_data
            
        except Exception as e:
            logger.error(f"❌ Workflow execution failed: {e}")
            raise
    
    def _process_node(self, node: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single node and return updated data"""
        node_type = node.get('type')
        
        try:
            if node_type == 'userQuery':
                # Already processed, just pass through
                return {
                    'query': data.get('query', ''),
                    'output': data.get('query', '')
                }
                
            elif node_type == 'knowledgeBase':
                query_text = data.get('query', '')
                logger.info(f"🔍 Querying knowledge base for: {query_text}")
                
                similar_docs = query_similar(query_text, n_results=3)
                
                # Format context from similar documents
                context = ""
                if similar_docs and similar_docs['documents'][0]:
                    for i, doc in enumerate(similar_docs['documents'][0]):
                        context += f"Document {i+1}: {doc}\n\n"
                
                return {
                    'query': query_text,
                    'context': context,
                    'similar_docs': similar_docs,
                    'output': context if context else "No relevant documents found in knowledge base."
                }
                
            elif node_type == 'llm':
                user_query = data.get('query', '')
                context = data.get('context', '')
                
                # Get node configuration
                model = node.get('model', 'gemini-2.5-flash')
                temperature = node.get('temperature', 0.7)
                api_key = node.get('apiKey', '')
                web_search_enabled = node.get('webSearch', False)
                
                # Prepare prompt for LLM
                prompt = f"""You are a helpful PDF assistant. Use the provided context from the PDF to answer the user's question.

CONTEXT FROM PDF:
{context}

USER QUESTION:
{user_query}

If the context doesn't contain relevant information to answer the question, please say so and provide a general helpful response based on your knowledge."""

                logger.info(f"🤖 Querying Gemini LLM with model: {model}, temperature: {temperature}")
                
                # Call Gemini LLM using your existing function
                llm_response = call_gemini(
                    prompt=prompt,
                    model=model,
                    temperature=temperature,
                    max_tokens=1024,
                    api_key=api_key
                )
                
                # If web search is enabled and context is insufficient
                if web_search_enabled and ("no relevant" in context.lower() or "not contain" in context.lower() or len(context.strip()) < 50):
                    logger.info("🌐 Performing web search for additional context")
                    search_results = web_search(user_query, api_key=api_key)
                    if search_results:
                        web_context = "\n".join([f"- {result.get('snippet', '')}" for result in search_results[:2]])
                        enhanced_prompt = f"{prompt}\n\nAdditional web context:\n{web_context}"
                        llm_response = call_gemini(
                            prompt=enhanced_prompt,
                            model=model,
                            temperature=temperature,
                            api_key=api_key
                        )
                
                return {
                    'query': user_query,
                    'context': context,
                    'llm_response': llm_response,
                    'output': llm_response
                }
                
            elif node_type == 'output':
                # Final output node - format the response
                llm_response = data.get('llm_response', '')
                context = data.get('context', '')
                query = data.get('query', '')
                
                if llm_response:
                    final_output = llm_response
                elif context:
                    final_output = f"Based on the documents: {context}"
                else:
                    final_output = f"Query: {query}\nNo additional processing applied."
                
                return {
                    'final_output': final_output,
                    'output': final_output
                }
                
            else:
                # Unknown node type, just pass through
                return data
                
        except Exception as e:
            logger.error(f"❌ Error processing node {node_type}: {e}")
            return {
                'error': f"Error in {node_type} node: {str(e)}",
                'output': f"Error processing {node_type}: {str(e)}"
            }
    
    def _get_next_node(self, current_node_id: str) -> str:
        """Find the next node ID based on connections"""
        for connection in self.connections:
            if connection.get('source') == current_node_id:
                return connection.get('target')
        return None

def execute_workflow(workflow_data: Dict[str, Any], query: str) -> Dict[str, Any]:
    """Execute workflow with the given query"""
    executor = WorkflowExecutor(workflow_data)
    return executor.execute_workflow(query)