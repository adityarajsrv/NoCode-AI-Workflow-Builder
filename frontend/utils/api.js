import axios from "axios";

const API_BASE = "http://localhost:8000/api"; 

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const workflowAPI = {
  // Build workflow (validate structure)
  build: (workflowData) => 
    api.post('/workflows/build', { workflow: workflowData }),
  
  // Execute workflow with query
  run: (workflowData, query) => 
    api.post('/workflows/run', { workflow: workflowData, query }),
  
  // Save workflow (if implementing persistence)
  save: (workflowData) => 
    api.post('/workflows/save', { workflow: workflowData }),
  
  // Load workflow
  load: (workflowId) => 
    api.get(`/workflows/${workflowId}`),
};

// Documents API
export const documentsAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// LLM API
export const llmAPI = {
  chat: (message, context = null) => 
    api.post('/llm/', { message, context }),
};

