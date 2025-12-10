import React, { useState, useRef } from 'react';
    import { Upload, Mic, Image as ImageIcon, Video, FileAudio, Loader2, PlayCircle } from 'lucide-react';
    import ReactMarkdown from 'react-markdown';
    import { analyzeMedia, transcribeAudio } from '../services/geminiService';
    
    const MediaAnalyzer: React.FC = () => {
      const [activeTab, setActiveTab] = useState<'image' | 'video' | 'audio'>('image');
      const [file, setFile] = useState<File | null>(null);
      const [previewUrl, setPreviewUrl] = useState<string | null>(null);
      const [analysis, setAnalysis] = useState<string>('');
      const [loading, setLoading] = useState(false);
      const [isRecording, setIsRecording] = useState(false);
      const mediaRecorderRef = useRef<MediaRecorder | null>(null);
      const audioChunksRef = useRef<Blob[]>([]);
    
      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          const f = e.target.files[0];
          setFile(f);
          setPreviewUrl(URL.createObjectURL(f));
          setAnalysis('');
        }
      };
    
      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data:mime/type;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = error => reject(error);
        });
      };
    
      const handleAnalysis = async () => {
        if (!file && !previewUrl) return; // previewUrl acts as placeholder for recorded audio too
        setLoading(true);
        setAnalysis('');
    
        try {
          if (activeTab === 'audio') {
              // For audio, we might have a file OR a recording blob URL
              if (file) {
                 const base64 = await convertFileToBase64(file);
                 const result = await transcribeAudio(base64);
                 setAnalysis(result);
              } else if (previewUrl && audioChunksRef.current.length > 0) {
                 // Handle recorded blob
                 const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                 const reader = new FileReader();
                 reader.readAsDataURL(blob);
                 reader.onloadend = async () => {
                    const base64 = (reader.result as string).split(',')[1];
                    const result = await transcribeAudio(base64);
                    setAnalysis(result);
                 };
              }
          } else {
             // Image or Video
             if (!file) return;
             const base64 = await convertFileToBase64(file);
             const mimeType = file.type;
             const result = await analyzeMedia("", base64, mimeType, activeTab === 'video');
             setAnalysis(result);
          }
        } catch (e) {
          console.error(e);
          setAnalysis("Error processing media.");
        } finally {
          setLoading(false);
        }
      };
    
      const startRecording = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];
    
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
    
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
            setPreviewUrl(URL.createObjectURL(blob));
            setFile(null); // Clear file if we recorded
          };
    
          recorder.start();
          setIsRecording(true);
        } catch (err) {
          console.error("Mic error:", err);
        }
      };
    
      const stopRecording = () => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      };
    
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex gap-4 mb-8 justify-center">
             <button onClick={() => { setActiveTab('image'); setFile(null); setPreviewUrl(null); setAnalysis(''); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'image' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
               <ImageIcon size={20} /> Image Analysis
             </button>
             <button onClick={() => { setActiveTab('video'); setFile(null); setPreviewUrl(null); setAnalysis(''); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'video' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
               <Video size={20} /> Video Insights
             </button>
             <button onClick={() => { setActiveTab('audio'); setFile(null); setPreviewUrl(null); setAnalysis(''); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${activeTab === 'audio' ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
               <Mic size={20} /> Transcription
             </button>
          </div>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] border-dashed">
               {activeTab !== 'audio' && !previewUrl && (
                  <label className="cursor-pointer flex flex-col items-center text-center p-8 w-full h-full justify-center">
                    <Upload className="text-white/30 mb-4" size={48} />
                    <span className="text-white/70 font-medium">Click to upload {activeTab}</span>
                    <input type="file" className="hidden" accept={activeTab === 'image' ? "image/*" : "video/*"} onChange={handleFileChange} />
                  </label>
               )}
    
               {activeTab === 'audio' && !previewUrl && (
                 <div className="flex flex-col items-center gap-6">
                    <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                      <Mic size={32} className="text-white" />
                    </button>
                    <div className="flex items-center gap-2 text-white/50">
                        <span className="text-sm">OR</span>
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-white/10 rounded-full text-sm hover:bg-white/20 transition-colors">
                      Upload Audio File
                      <input type="file" className="hidden" accept="audio/*" onChange={handleFileChange} />
                    </label>
                 </div>
               )}
    
               {previewUrl && (
                 <div className="w-full relative">
                    {activeTab === 'image' && <img src={previewUrl} alt="Preview" className="rounded-lg max-h-[300px] mx-auto" />}
                    {activeTab === 'video' && <video src={previewUrl} controls className="rounded-lg max-h-[300px] mx-auto" />}
                    {activeTab === 'audio' && (
                        <div className="flex flex-col items-center justify-center h-[200px] bg-white/5 rounded-lg">
                             <FileAudio size={48} className="text-blue-400 mb-4" />
                             <audio src={previewUrl} controls />
                        </div>
                    )}
                    <button 
                      onClick={() => { setFile(null); setPreviewUrl(null); setAnalysis(''); }}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                        <Upload size={14} className="rotate-45" /> {/* Close/Reset icon simulation */}
                    </button>
                 </div>
               )}
    
               {previewUrl && (
                 <button 
                   onClick={handleAnalysis}
                   disabled={loading}
                   className="mt-6 w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : (activeTab === 'audio' ? 'Transcribe' : 'Analyze')}
                 </button>
               )}
            </div>
    
            {/* Output Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[300px] overflow-y-auto">
              <h3 className="text-lg font-serif text-white/80 mb-4 border-b border-white/5 pb-2">
                {activeTab === 'audio' ? 'Transcript' : 'Analysis Results'}
              </h3>
              {analysis ? (
                <div className="prose prose-invert prose-sm">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-white/20 italic">
                   Results will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };
    
    export default MediaAnalyzer;
    