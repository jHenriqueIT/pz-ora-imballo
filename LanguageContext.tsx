import React, { createContext, useState, useContext, useCallback } from 'react';
import { translations } from './translations';

type Language = 'pt' | 'it';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('pt');

    const toggleLanguage = useCallback(() => {
        setLanguage(prevLang => (prevLang === 'pt' ? 'it' : 'pt'));
    }, []);

    const t = useCallback((key: string): string => {
        const langDict = translations[language] as { [key: string]: string };
        return langDict[key] || key; // Return key if not found
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslations = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslations must be used within a LanguageProvider');
    }
    return context;
};
