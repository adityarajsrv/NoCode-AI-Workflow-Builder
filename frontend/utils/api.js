import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const AUTH_API = import.meta.env.VITE_AUTH_API;

const nodeAPI = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

const api = axios.create({
  baseURL: AUTH_API,
  headers: {
    "Content-Type": "application/json",
  },
});

nodeAPI.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const stackAPI = {
  getStacks: () => nodeAPI.get("/stacks"),
  
  createStack: (stackData) => nodeAPI.post("/stacks", stackData),
  
  updateStack: (stackId, updateData) => 
    nodeAPI.put(`/stacks/${stackId}`, updateData),
  
  deleteStack: (stackId) => nodeAPI.delete(`/stacks/${stackId}`),
  
  upgradeToPremium: () => nodeAPI.post("/stacks/upgrade-to-premium"),
  
  forcePremium: (userId) => nodeAPI.post(`/stacks/force-premium/${userId}`),
};

export const authAPI = {
  login: (credentials) => nodeAPI.post("/auth/login", credentials),
  register: (userData) => nodeAPI.post("/auth/register", userData),
  getProfile: () => nodeAPI.get("/auth/profile"),
};

export const workflowAPI = {
  build: (workflowData) => 
    api.post('/workflows/build', { workflow: workflowData }),
  
  run: (workflowData, query, session_id = null) => 
    api.post('/workflows/run', { 
      workflow: workflowData, 
      query,
      session_id: session_id || `session_${Date.now()}`
    }),
  
  save: (workflowData) => 
    api.post('/workflows/save', { workflow: workflowData }),
  
  load: (workflowId) => 
    api.get(`/workflows/${workflowId}`),
};

export const documentsAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const llmAPI = {
  chat: (prompt, temperature = 0.7, api_key = null, model = "gemini-2.5-flash", use_websearch = false, serp_api_key = null) => 
    api.post('/llm/', { 
      prompt, 
      temperature, 
      api_key, 
      model, 
      use_websearch, 
      serp_api_key 
    }),
};

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

export { nodeAPI, api };