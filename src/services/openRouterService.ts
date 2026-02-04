import { ILLMProvider } from "./llmProvider";
import { ResearchResult, SearchOptions } from "../types";

export class OpenRouterService implements ILLMProvider {
    private apiKey: string;
    private baseUrl = "https://openrouter.ai/api/v1/chat/completions";

    constructor(apiKey?: string) {
        this.apiKey = apiKey || import.meta.env.VITE_OPENROUTER_API_KEY || "";
    }

    async research(query: string, _useMaps?: boolean, _options?: SearchOptions): Promise<ResearchResult> {
        const modelId = "google/gemini-2.0-flash-exp:free";

        const systemInstruction = `You are Lumina, a world-class AI research assistant.
    Format your response in beautiful Markdown.
    Structure: Executive Summary, Direct Matches, Relevant Divergent Findings, Key Details.
    Provide a 'Theme Color' suggestion at the end like: "THEME_COLOR: #HexCode"`;

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://lumina-research.vercel.app", // Optional
                    "X-Title": "Lumina Research"
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: query }
                    ]
                })
            });

            const data = await response.json();
            const text = data.choices[0].message.content || "No results found.";

            const colorMatch = text.match(/THEME_COLOR:\s*(#[0-9A-Fa-f]{6})/);
            const themeColor = colorMatch ? colorMatch[1] : undefined;
            const cleanText = text.replace(/THEME_COLOR:\s*#[0-9A-Fa-f]{6}/, '').trim();

            return {
                markdown: cleanText,
                groundingChunks: [],
                themeColor
            };
        } catch (error) {
            console.error("OpenRouter Research Error:", error);
            throw error;
        }
    }

    async deepThink(query: string): Promise<string> {
        const modelId = "google/gemini-2.0-flash-exp:free";
        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: [
                        { role: "user", content: `Analyze the following query deeply and provide advanced insights:\n\n${query}` }
                    ]
                })
            });

            const data = await response.json();
            return data.choices[0].message.content || "No insights generated.";
        } catch (error) {
            console.error("OpenRouter Thinking Error:", error);
            throw error;
        }
    }

    async chat(history: { role: string; parts: { text: string }[] }[], newMessage: string): Promise<string> {
        const modelId = "google/gemini-2.0-flash-exp:free";
        const messages = history.map(h => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts[0].text
        }));
        messages.push({ role: 'user', content: newMessage });

        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: messages
                })
            });

            const data = await response.json();
            return data.choices[0].message.content || "";
        } catch (error) {
            console.error("OpenRouter Chat Error:", error);
            throw error;
        }
    }
}
