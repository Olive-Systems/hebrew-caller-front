import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const defaultSettings = {
  mainPrompt: {
    instructions: "You are a friendly AI assistant who helps schedule calls. Your goal is to schedule a call with the user. Be friendly and professional.",
    voice: "alloy"
  },
  immediateResponse: {
    instructions: "Ask user if he's free to talk",
    max_output_tokens: 1024
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('aiCallerSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('aiCallerSettings', JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 