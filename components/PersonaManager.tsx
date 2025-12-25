import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Trash2, Plus, check, AlertCircle, User } from 'lucide-react';
import { PersonaProfile } from '../types';
import { analyzePersona } from '../services/geminiService';

interface PersonaManagerProps {
  personas: PersonaProfile[];
  setPersonas: React.Dispatch<React.SetStateAction<PersonaProfile[]>>;
  onSelect: (p: PersonaProfile) => void;
}

export const PersonaManager: React.FC<PersonaManagerProps> = ({ personas, setPersonas, onSelect }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePersona = async () => {
    if (!name || !sampleText || !selectedImage) {
      setError("Please fill in all fields and upload an image.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newPersona = await analyzePersona(name, sampleText, selectedImage);
      setPersonas(prev => [...prev, newPersona]);
      setIsCreating(false);
      resetForm();
    } catch (err) {
      setError("Failed to create persona. Please check your API key and connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePersona = (id: string) => {
    setPersonas(prev => prev.filter(p => p.id !== id));
  };

  const resetForm = () => {
    setName('');
    setSampleText('');
    setSelectedImage(null);
    setError(null);
  };

  if (isCreating) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Create New Persona</h2>
          <button 
            onClick={() => setIsCreating(false)}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 space-y-6">
          {/* Image Upload */}
          <div className="flex flex-col items-center justify-center">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                 selectedImage ? 'border-indigo-500' : 'border-slate-600 hover:border-slate-400'
               }`}
             >
               {selectedImage ? (
                 <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <Upload className="w-8 h-8 text-slate-500" />
               )}
             </div>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
               accept="image/*" 
               className="hidden" 
             />
             <p className="mt-2 text-sm text-slate-400">Upload a representative photo</p>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Persona Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="e.g. Tech Reviewer Tom"
            />
          </div>

          {/* Text Sample */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Writing/Speaking Sample</label>
            <textarea 
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-40 resize-none"
              placeholder="Paste a typical script, caption, or transcript here..."
            />
            <p className="mt-1 text-xs text-slate-500">The AI will analyze tone, vocabulary, and sentence structure.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <button
            onClick={handleCreatePersona}
            disabled={isLoading}
            className={`w-full py-4 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all ${
              isLoading 
                ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Analyzing Persona Style...</span>
              </>
            ) : (
              <span>Create & Analyze Persona</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">Persona Library</h2>
           <p className="text-slate-400">Manage stylistic profiles for your content generation.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>New Persona</span>
        </button>
      </div>

      {personas.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No personas yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">Create your first digital persona by analyzing a photo and text sample.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Get Started &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map(persona => (
            <div key={persona.id} className="bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 transition-all rounded-xl overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={persona.avatarUrl || 'https://picsum.photos/100/100'} 
                      alt={persona.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-600 group-hover:border-indigo-500 transition-colors"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white">{persona.name}</h3>
                      <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded">Analyzed</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deletePersona(persona.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Language Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {persona.analysis.languageFeatures.slice(0, 3).map((feat, i) => (
                        <span key={i} className="text-xs bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Visual Style</h4>
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {persona.analysis.visualFeatures.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
                   <button 
                     onClick={() => onSelect(persona)}
                     className="text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors w-full"
                   >
                     Use for Script
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};