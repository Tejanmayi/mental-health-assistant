const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
    // Health check
    checkHealth: async () => {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.json();
    },

    // Authentication
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        return response.json();
    },

    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    // Depression Prediction
    predictDepression: async (data) => {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    getPredictionHistory: async () => {
        const response = await fetch(`${API_BASE_URL}/predict/history`);
        return response.json();
    }
}; 