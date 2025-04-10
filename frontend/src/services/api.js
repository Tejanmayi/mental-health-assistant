const API_BASE_URL = 'https://mental-health-backend-gho3.onrender.com';

export const analyzeText = async (text) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error('Failed to analyze text');
        }

        return await response.json();
    } catch (error) {
        console.error('Error analyzing text:', error);
        throw error;
    }
};

export const extractText = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/extract`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to extract text');
        }

        return await response.json();
    } catch (error) {
        console.error('Error extracting text:', error);
        throw error;
    }
};

export const api = {
    // Health check
    checkHealth: async () => {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
            credentials: 'include'
        });
        return response.json();
    },

    // Authentication
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
        });
        return response.json();
    },

    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    // Depression Prediction
    predictDepression: async (data) => {
        const response = await fetch(`${API_BASE_URL}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });
        return response.json();
    },

    getPredictionHistory: async () => {
        const response = await fetch(`${API_BASE_URL}/api/predict/history`, {
            credentials: 'include'
        });
        return response.json();
    },

    async predict(clinicalNotes) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ text: clinicalNotes }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error predicting depression:', error);
            throw error;
        }
    },
}; 