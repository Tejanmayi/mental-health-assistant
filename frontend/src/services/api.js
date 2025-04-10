const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = {
    // Health check
    checkHealth: async () => {
        const response = await fetch(`${API_URL}/api/health`);
        return response.json();
    },

    // Authentication
    login: async (credentials) => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        return response.json();
    },

    register: async (userData) => {
        const response = await fetch(`${API_URL}/api/auth/register`, {
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
        const response = await fetch(`${API_URL}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    getPredictionHistory: async () => {
        const response = await fetch(`${API_URL}/api/predict/history`);
        return response.json();
    },

    async predict(clinicalNotes) {
        try {
            const response = await fetch(`${API_URL}/api/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clinicalNotes }),
            });

            if (!response.ok) {
                throw new Error('Failed to process prediction');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

export { api }; 