import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Play, Copy, RefreshCw, ChevronRight, Video, Youtube, MessageCircle, FileText } from 'lucide-react';
import { PersonaProfile, Platform } from '../types';
import { generateScript } from '../services/geminiService';

interface ScriptGeneratorProps {
  personas: PersonaProfile[];
  initialPersona?: PersonaProfile | null;
}

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ personas, initialPersona }) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(initialPersona?.id || '');
  const [platform, setPlatform] = useState<Platform>(Platform.DOUYIN);
  const [mode, setMode] = useState<'rewrite' | 'create'>('create');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const platforms = Object.values(Platform);

  const getPlatformIcon = (p: Platform) => {
    switch (p) {
      case Platform.YOUTUBE: return <Youtube className="w-5 h-5 text-red-500" />;
      case Platform.DOUYIN: 
      case Platform.KUAISHOU:
        return <Video className="w-5 h-5 text-indigo-400" />;
      case Platform.WECHAT_OFFICIAL:
        return <FileText className="w-5 h-5 text-green-500" />;
      default: return <MessageCircle className="w-5 h-5 text-pink-400" />;
    }
  };

  const handleGenerate = async () => {
    const persona = personas.find(p => p.id === selectedPersonaId);
    if (!persona || !topic) return;

    setIsGenerating(true);
    setResult(null);
    try {
      const script = await generateScript(platform, persona, topic, mode);
      setResult(script);
    } catch (e) {
      console.error(e);
      setResult("Error generating script. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* LEFT: Controls */}
      <div className="space-y-8 overflow-y-auto pr-2 pb-10">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Script Configuration</h2>
          
          {/* Persona Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">1. Select Persona Style</label>
            {personas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {personas.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPersonaId(p.id)}
                    className={`cursor-pointer rounded-lg p-3 border flex items-center space-x-3 transition-all ${
                      selectedPersonaId === p.id
                        ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                    <span className="font-medium text-slate-200">{p.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                No personas available. Please go to Persona Manager to create one.
              </div>
            )}
          </div>

          {/* Platform Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">2. Target Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`flex items-center space-x-2 px-3 py-3 rounded-lg border text-sm text-left transition-all ${
                    platform === p 
                      ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {getPlatformIcon(p)}
                  <span className="truncate">{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mode & Topic */}
          <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-400 mb-2">3. Mode</label>
               <div className="flex bg-slate-800 p-1 rounded-lg w-full sm:w-auto inline-flex">
                 <button
                   onClick={() => setMode('create')}
                   className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                     mode === 'create' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                   }`}
                 >
                   Original Creation
                 </button>
                 <button
                   onClick={() => setMode('rewrite')}
                   className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                     mode === 'rewrite' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                   }`}
                 >
                   Rewrite Text
                 </button>
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-400 mb-2">
                 {mode === 'create' ? '4. Topic / Theme' : '4. Original Text to Rewrite'}
               </label>
               <textarea
                 value={topic}
                 onChange={(e) => setTopic(e.target.value)}
                 className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                 placeholder={mode === 'create' ? "e.g., Reviewing the iPhone 16 Pro..." : "Paste your existing draft here..."}
               />
             </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedPersonaId || !topic}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all shadow-lg ${
            isGenerating || !selectedPersonaId || !topic
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Crafting Script...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Generate Script</span>
            </>
          )}
        </button>
      </div>

      {/* RIGHT: Output */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <div className="w-3 h-3 rounded-full bg-red-500"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
             <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-slate-400">Output Console</span>
        </div>
        
        <div className="flex-1 overflow-auto p-6 text-slate-300">
          {result ? (
            <div className="prose prose-invert prose-indigo max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <ChevronRight className="w-8 h-8 opacity-50" />
              </div>
              <p>Ready to generate. Configure the settings on the left.</p>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-slate-900 p-4 border-t border-slate-800 flex justify-end">
            <button 
              onClick={() => navigator.clipboard.writeText(result)}
              className="flex items-center space-x-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Markdown</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
