const API_BASE_URL = '/api';

const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

export const analyzeText = async (text) => {
    try {
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: defaultHeaders,
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

        const response = await fetch(`${API_BASE_URL}/extract`, {
            method: 'POST',
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
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.json();
    },

    // Authentication
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(credentials),
        });
        return response.json();
    },

    register: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    // Depression Prediction
    predictDepression: async (data) => {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(data),
        });
        return response.json();
    },

    getPredictionHistory: async () => {
        const response = await fetch(`${API_BASE_URL}/predict/history`);
        return response.json();
    },

    async predict(clinicalNotes) {
        try {
            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: defaultHeaders,
                body: JSON.stringify({ text: clinicalNotes }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error predicting depression:', error);
            throw error;
        }
    },
}; 