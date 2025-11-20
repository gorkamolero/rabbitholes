import axios from 'axios';

const API_BASE_URL = typeof window !== 'undefined' ? '/api' : 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const searchRabbitHole = async (params: {
    query: string;
    previousConversation?: Array<{ user?: string; assistant?: string }>;
    concept?: string;
    followUpMode?: "expansive" | "focused";
}, signal?: AbortSignal) => {
    const response = await api.post('/rabbitholes/search', params, { signal });
    return response.data;
};

export const getSuggestions = async (params: {
    query: string;
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    mode?: 'expansive' | 'focused';
}) => {
    const response = await api.post('/rabbitholes/suggestions', params);
    return response.data;
};

export default api;
