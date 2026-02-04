import { LLMProvider } from "../types";
import { DeepSeekService } from "./deepseekService";
import { GeminiService } from "./geminiService";
import { GroqService } from "./groqService";
import { ILLMProvider } from "./llmProvider";
import { OpenRouterService } from "./openRouterService";

export const getProvider = (provider: LLMProvider, apiKey?: string): ILLMProvider => {
    switch (provider) {
        case LLMProvider.GEMINI:
            return new GeminiService(apiKey);
        case LLMProvider.GROQ:
            return new GroqService(apiKey);
        case LLMProvider.DEEPSEEK:
            return new DeepSeekService(apiKey);
        case LLMProvider.OPENROUTER:
            return new OpenRouterService(apiKey);
        default:
            return new GeminiService(apiKey);
    }
};
