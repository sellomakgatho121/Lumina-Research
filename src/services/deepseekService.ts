import { ILLMProvider } from "./llmProvider";
import { ResearchResult, SearchOptions } from "../types";

export class DeepSeekService implements ILLMProvider {
    private apiKey: string;
    private baseUrl = "https://api.deepseek.com/chat/completions";

    constructor(apiKey?: string) {
        this.apiKey = apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY || "";
    }

    async research(query: string, _useMaps?: boolean, _options?: SearchOptions): Promise<ResearchResult> {
        const modelId = "deepseek-chat"; // Regular DeepSeek V3 for standard research

        const systemInstruction = `You are Lumina, a world-class AI research assistant.
    Format your response in beautiful Markdown.
    Structure: Executive Summary, Direct Matches, Relevant Divergent Findings, Key Details.
    Provide a 'Theme Color' suggestion at the end like: "THEME_COLOR: #HexCode"`;

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
            console.error("DeepSeek Research Error:", error);
            throw error;
        }
    }

    async deepThink(query: string): Promise<string> {
        const modelId = "deepseek-reasoner"; // DeepSeek R1 for deep thinking
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
                        { role: "user", content: query }
                    ]
                })
            });

            const data = await response.json();
            // R1 provides reasoning_content optionally, but we'll return the final content
            return data.choices[0].message.content || "No insights generated.";
        } catch (error) {
            console.error("DeepSeek Thinking Error:", error);
            throw error;
        }
    }

    async chat(history: { role: string; parts: { text: string }[] }[], newMessage: string): Promise<string> {
        const modelId = "deepseek-chat";
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
            console.error("DeepSeek Chat Error:", error);
            throw error;
        }
    }
}
