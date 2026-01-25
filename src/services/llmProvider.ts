import { ResearchResult, SearchOptions } from "../types";

export interface ILLMProvider {
    research(query: string, useMaps?: boolean, options?: SearchOptions): Promise<ResearchResult>;
    deepThink(query: string): Promise<string>;
    chat(history: { role: string; parts: { text: string }[] }[], newMessage: string): Promise<string>;
}

export const PROVIDER_CONFIGS = {
    gemini: {
        id: 'gemini',
        name: 'Gemini',
        models: ['gemini-2.5-flash', 'gemini-3-pro-preview'],
        defaultModel: 'gemini-2.5-flash',
        isHighReasoning: true
    },
    groq: {
        id: 'groq',
        name: 'Groq',
        models: ['llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b'],
        defaultModel: 'llama-3.3-70b-versatile',
        isHighReasoning: true
    },
    deepseek: {
        id: 'deepseek',
        name: 'DeepSeek',
        models: ['deepseek-reasoner'],
        defaultModel: 'deepseek-reasoner',
        isHighReasoning: true
    },
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        models: ['google/gemini-2.0-flash-exp:free', 'mistralai/mistral-7b-instruct:free'],
        defaultModel: 'google/gemini-2.0-flash-exp:free',
        isHighReasoning: false
    }
};
