import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";

const updateScreenTool: FunctionDeclaration = {
  name: 'update_screen',
  description: 'Update the main display with research findings, summaries, or lists. Use this when the answer is long or detailed.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content_markdown: { type: Type.STRING, description: 'Markdown formatted content' },
    },
    required: ['title', 'content_markdown']
  }
};

export class LuminaSession {
  private client: GoogleGenAI;
  private session: any;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private inputProcessor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private onScreenUpdate: (data: { title: string; content: string }) => void;
  private onStatusChange: (status: string) => void;

  constructor(
    onScreenUpdate: (data: { title: string; content: string }) => void,
    onStatusChange: (status: string) => void
  ) {
    this.client = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.onScreenUpdate = onScreenUpdate;
    this.onStatusChange = onStatusChange;
  }

  async connect() {
    this.onStatusChange('Connecting...');
    
    this.inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = this.client.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: async () => {
          this.onStatusChange('Connected');
          await this.startAudioInput(sessionPromise);
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleMessage(message, sessionPromise);
        },
        onclose: () => {
          this.onStatusChange('Disconnected');
        },
        onerror: (e) => {
          console.error("Live API Error:", e);
          this.onStatusChange('Error');
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: `You are Lumina, a world-class AI research assistant capable of investigating any topic across all fields (Science, Arts, Culture, Engineering, Humanities, etc.). 
        You have a warm, friendly, and professional persona with a gentle, inviting tone (aim for a friendly African female persona). 
        You are helpful, precise, and encouraging.
        
        Research Strategy:
        - Research extensively across all matching sources of information.
        - Organize findings into "Direct Matches" and "Relevant Divergent Findings".
        
        Communication:
        - When you find information, summarize it verbally.
        - ALWAYS use the 'update_screen' tool to present the detailed, structured Markdown findings to the user. Ensure the markdown clearly distinguishes between direct matches and relevant divergent information.`,
        tools: [{ googleSearch: {} }, { functionDeclarations: [updateScreenTool] }],
      },
    });

    this.session = sessionPromise;
  }

  private async startAudioInput(sessionPromise: Promise<any>) {
    if (!this.inputContext || !this.stream) return;

    this.source = this.inputContext.createMediaStreamSource(this.stream);
    this.inputProcessor = this.inputContext.createScriptProcessor(4096, 1, 1);

    this.inputProcessor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      sessionPromise.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.source.connect(this.inputProcessor);
    this.inputProcessor.connect(this.inputContext.destination);
  }

  private async handleMessage(message: LiveServerMessage, sessionPromise: Promise<any>) {
    // Handle Audio
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputContext) {
      this.playAudio(base64Audio);
    }

    // Handle Tool Calls
    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls) {
        if (fc.name === 'update_screen') {
          const { title, content_markdown } = fc.args as any;
          this.onScreenUpdate({ title, content: content_markdown });
          
          // Send response back
          sessionPromise.then((session) => {
             session.sendToolResponse({
               functionResponses: {
                 id: fc.id,
                 name: fc.name,
                 response: { result: "Screen updated successfully." }
               }
             });
          });
        }
      }
    }
  }

  private async playAudio(base64: string) {
    if (!this.outputContext) return;
    
    try {
      this.nextStartTime = Math.max(this.nextStartTime, this.outputContext.currentTime);
      const audioBuffer = await this.decodeAudioData(base64, this.outputContext);
      
      const source = this.outputContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputContext.destination);
      source.addEventListener('ended', () => {
        this.sources.delete(source);
      });
      
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.sources.add(source);
    } catch (e) {
      console.error("Audio Decode Error", e);
    }
  }

  async disconnect() {
    if (this.session) {
      const s = await this.session;
      // s.close() might not exist on the type depending on version, but usually does
      // Assuming resource cleanup is sufficient
    }
    
    this.source?.disconnect();
    this.inputProcessor?.disconnect();
    this.stream?.getTracks().forEach(t => t.stop());
    this.inputContext?.close();
    this.outputContext?.close();
    
    for (const source of this.sources) {
      source.stop();
    }
    this.sources.clear();
    
    this.onStatusChange('Disconnected');
  }

  // Utils
  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async decodeAudioData(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }
}