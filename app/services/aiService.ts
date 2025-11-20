/**
 * AI Service using Vercel AI SDK 6 with OpenRouter
 * OpenRouter is OpenAI-compatible, so we use their API directly
 */

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
}

export class AIService {
    private static instance: AIService | null = null;
    private apiKey: string;
    private baseURL: string = 'https://openrouter.ai/api/v1';
    private defaultModel: string = 'google/gemini-2.0-flash-001';

    private constructor() {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY is not set in environment variables');
        }
        this.apiKey = apiKey;
    }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    public async createChatCompletion(
        messages: Message[],
        model?: string
    ): Promise<ChatCompletionResponse> {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                'X-Title': 'RabbitHoles',
            },
            body: JSON.stringify({
                model: model || this.defaultModel,
                messages,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
        }

        return response.json();
    }

    public async createStreamCompletion(
        messages: Message[],
        model?: string,
        signal?: AbortSignal
    ): Promise<ReadableStream> {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                'X-Title': 'RabbitHoles',
            },
            body: JSON.stringify({
                model: model || this.defaultModel,
                messages,
                stream: true,
            }),
            signal,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        return response.body;
    }
}

// Export a function to get the service instance
export const getAIService = () => AIService.getInstance();
