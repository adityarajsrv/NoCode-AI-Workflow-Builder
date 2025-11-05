from typing import List, Dict
import datetime

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
        
        if len(self.conversations[session_id]) > self.max_history:
            self.conversations[session_id] = self.conversations[session_id][-self.max_history:]
    
    def get_conversation_history(self, session_id: str) -> List[Dict]:
        return self.conversations.get(session_id, [])
    
    def get_context_summary(self, session_id: str) -> str:
        history = self.get_conversation_history(session_id)
        if not history:
            return "No previous conversation context."
        
        context_lines = ["Previous conversation context:"]
        for msg in history[-4:]:  
            role = "User" if msg["role"] == "user" else "Assistant"
            context_lines.append(f"{role}: {msg['content']}")
        
        return "\n".join(context_lines)

conversation_memory = ConversationMemory()