import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PersonaManager } from './components/PersonaManager';
import { ScriptGenerator } from './components/ScriptGenerator';
import { PersonaProfile } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personas' | 'generator'>('personas');
  
  // Persist personas in localStorage
  const [personas, setPersonas] = useState<PersonaProfile[]>(() => {
    const saved = localStorage.getItem('scriptai_personas');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedPersonaForGen, setSelectedPersonaForGen] = useState<PersonaProfile | null>(null);

  useEffect(() => {
    localStorage.setItem('scriptai_personas', JSON.stringify(personas));
  }, [personas]);

  const handleSelectPersona = (persona: PersonaProfile) => {
    setSelectedPersonaForGen(persona);
    setActiveTab('generator');
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'personas' ? (
        <PersonaManager 
          personas={personas} 
          setPersonas={setPersonas} 
          onSelect={handleSelectPersona}
        />
      ) : (
        <ScriptGenerator 
          personas={personas} 
          initialPersona={selectedPersonaForGen}
        />
      )}
    </Layout>
  );
};

export default App;
