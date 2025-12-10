import { GoogleGenAI, Modality, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ResearchResult, SearchOptions } from "../types";

// Note: In a production environment, this should be handled securely.
// The prompt instructions specify using process.env.API_KEY directly.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// -- 1. Research with Grounding (Search or Maps) --
export const searchResearch = async (
  query: string, 
  useMaps: boolean = false,
  options?: SearchOptions
): Promise<ResearchResult> => {
  const ai = getAI();
  const modelId = 'gemini-2.5-flash';
  
  const tools = useMaps ? [{ googleMaps: {} }] : [{ googleSearch: {} }];
  
  // Construct augmented query based on advanced options
  let augmentedQuery = query;
  if (options) {
    const constraints: string[] = [];
    if (options.dateRange?.start || options.dateRange?.end) {
      constraints.push(`Timeframe: ${options.dateRange.start || 'any'} to ${options.dateRange.end || 'present'}`);
    }
    if (options.pubType && options.pubType !== 'All') {
      constraints.push(`Source Type Focus: ${options.pubType}`);
    }
    if (options.excludeKeywords) {
      constraints.push(`Exclude keywords: ${options.excludeKeywords}`);
    }
    if (options.sortBy === 'date') {
      constraints.push(`Sort Requirement: Present results in reverse chronological order (newest first).`);
    }

    if (constraints.length > 0) {
      augmentedQuery += `\n\nConstraints & Preferences:\n- ${constraints.join('\n- ')}`;
    }
  }

  const systemInstruction = `You are Lumina, a world-class AI research assistant capable of investigating any topic across all fields of expertise (Science, Engineering, Arts, Culture, Humanities, History, etc.).
  
  Your goal is to research extensively across all matching sources of information, not limiting yourself to a single domain unless specified.
  Format your response in beautiful, readable Markdown.
  
  Structure & Organization:
  1. **Executive Summary**: A concise, high-level overview of the core findings.
  2. **Direct Matches**: Detailed findings that strictly match the user's request. Organize these clearly by category, theme, or relevance. Define terms and concepts clearly.
  3. **Relevant Divergent Findings**: If you discover information that falls outside the immediate scope but is highly relevant, provides crucial context, or offers a valuable alternative perspective, present it here. You MUST clearly label this section and explain *why* these divergent findings are relevant.
  4. **Key Details**: Specific attributes relevant to the field (e.g., technical specs for engineering, historical context for art, methodology for science, cultural impact for humanities).
  
  Visuals:
  If the search results contain direct image URLs or if you can construct a valid image URL from the source (e.g. valid Wikimedia, public dataset charts), embed them using standard markdown image syntax: ![Alt Text](URL). 
  Do not hallucinate URLs. Only use images if you are reasonably sure they exist.
  
  Grounding:
  If using Search, explicitly cite sources.
  If using Maps, find specific locations (labs, universities, museums, historical sites, centers).
  
  Styling:
  Provide a 'Theme Color' suggestion at the very end on a new line like: "THEME_COLOR: #HexCode" based on the research topic.
  
  If the user provided constraints (dates, types), STRICTLY adhere to them.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: augmentedQuery,
      config: {
        tools: tools,
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text || "No results found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract theme color if present
    const colorMatch = text.match(/THEME_COLOR:\s*(#[0-9A-Fa-f]{6})/);
    const themeColor = colorMatch ? colorMatch[1] : undefined;
    const cleanText = text.replace(/THEME_COLOR:\s*#[0-9A-Fa-f]{6}/, '').trim();

    // Map SDK chunks to local type to fix type mismatch (SDK has optional uri/title)
    const sanitizedChunks = chunks.map((chunk: any) => ({
      web: chunk.web ? {
        uri: chunk.web.uri || '',
        title: chunk.web.title || ''
      } : undefined,
      maps: chunk.maps ? {
        uri: chunk.maps.uri || '',
        title: chunk.maps.title || ''
      } : undefined
    }));

    return {
      markdown: cleanText,
      groundingChunks: sanitizedChunks,
      themeColor
    };
  } catch (error) {
    console.error("Search Error:", error);
    throw error;
  }
};

// -- 2. Deep Thinking Research --
export const deepThinkResearch = async (query: string): Promise<string> => {
  const ai = getAI();
  const modelId = 'gemini-3-pro-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: query,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max for Pro
      }
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Thinking Error:", error);
    throw error;
  }
};

// -- 3. Fast Response (Lite) --
export const fastCategorize = async (text: string): Promise<string> => {
  const ai = getAI();
  const modelId = 'gemini-2.5-flash-lite-latest'; // Mapping for flash-lite
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Suggest 3 short tags for this research query: "${text}". Return comma separated.`,
    });
    return response.text || "";
  } catch (error) {
    return "";
  }
};

// -- 4. Chat (Pro) --
export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string
) => {
  const ai = getAI();
  const modelId = 'gemini-3-pro-preview';
  
  try {
    const chat = ai.chats.create({
      model: modelId,
      history: history,
      config: {
        systemInstruction: "You are a helpful, intelligent research assistant.",
      }
    });
    
    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

// -- 5. Multimodal Analysis (Images/Video) --
export const analyzeMedia = async (
  prompt: string,
  base64Data: string,
  mimeType: string,
  isVideo: boolean = false
): Promise<string> => {
  const ai = getAI();
  // Prompt requirement: "use model gemini-3-pro-preview" for video and images
  const modelId = 'gemini-3-pro-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: prompt || (isVideo ? "Analyze this video for key research insights." : "Analyze this image for scientific data.") }
        ]
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Media Analysis Error:", error);
    throw error;
  }
};

// -- 6. Audio Transcription --
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  const ai = getAI();
  const modelId = 'gemini-2.5-flash'; // Prompt requirement

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/mp3', data: base64Audio } }, // Assuming MP3 or similar container from recorder
          { text: "Transcribe this audio accurately. Only return the transcribed text." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
};

// -- 7. TTS --
export const generateSpeech = async (text: string): Promise<ArrayBuffer | null> => {
  const ai = getAI();
  const modelId = 'gemini-2.5-flash-preview-tts';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually good for clarity
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};