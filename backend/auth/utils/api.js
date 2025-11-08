const API_BASE_URL = `${process.env.AUTH_URL}/api` || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const stackAPI = {
  getStacks: async () => {
    const response = await fetch(`${API_BASE_URL}/stacks`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to fetch stacks');
    }
    const result = await response.json();
    return result.data;
  },

  createStack: async (stackData) => {
    const response = await fetch(`${API_BASE_URL}/stacks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stackData)
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to create stack');
    }
    const result = await response.json();
    return result.data;
  },

  updateStack: async (stackId, stackData) => {
    const response = await fetch(`${API_BASE_URL}/stacks/${stackId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(stackData)
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to update stack');
    }
    const result = await response.json();
    return result.data;
  },

  deleteStack: async (stackId) => {
    const response = await fetch(`${API_BASE_URL}/stacks/${stackId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to delete stack');
    }
    return await response.json();
  }
};

export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Login failed');
    const result = await response.json();
    return result.data;
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Registration failed');
    const result = await response.json();
    return result.data;
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    const result = await response.json();
    return result.data;
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    const result = await response.json();
    return result.data;
  }
};

const FASTAPI_BASE_URL = 'http://localhost:8000/api';

export const workflowAPI = {
  saveWorkflow: async (workflowData) => {
    const response = await fetch(`${FASTAPI_BASE_URL}/workflows`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(workflowData)
    });
    if (!response.ok) throw new Error('Failed to save workflow');
    return response.json();
  },
  
  getWorkflows: async () => {
    const response = await fetch(`${FASTAPI_BASE_URL}/workflows`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch workflows');
    return response.json();
  }
};

export const chatAPI = {
  sendMessage: async (chatData) => {
    const response = await fetch(`${FASTAPI_BASE_URL}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(chatData)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  }
};