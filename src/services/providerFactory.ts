import { LLMProvider } from "../types";
import { DeepSeekService } from "./deepseekService";
import { GeminiService } from "./geminiService";
import { GroqService } from "./groqService";
import { ILLMProvider } from "./llmProvider";
import { OpenRouterService } from "./openRouterService";

export const getProvider = (provider: LLMProvider): ILLMProvider => {
    switch (provider) {
        case LLMProvider.GEMINI:
            return new GeminiService();
        case LLMProvider.GROQ:
            return new GroqService();
        case LLMProvider.DEEPSEEK:
            return new DeepSeekService();
        case LLMProvider.OPENROUTER:
            return new OpenRouterService();
        default:
            return new GeminiService();
    }
};
