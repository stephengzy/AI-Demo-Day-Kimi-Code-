'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language, Translations } from '@/lib/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 固定中文，暂时不支持切换
  const [lang] = useState<Language>('zh');

  // 简化：不支持语言切换，减少状态管理
  const handleSetLang = () => {
    console.log('Language switch is temporarily disabled');
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
