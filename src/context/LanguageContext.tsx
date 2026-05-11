"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, translations } from "@/locales/dictionary";

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: typeof translations["en"];
}

const LanguageContext = createContext<LanguageContextType>({
    locale: "uz",
    setLocale: () => { },
    t: translations["uz"],
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocaleState] = useState<Locale>("uz");

    useEffect(() => {
        const saved = localStorage.getItem("locale") as Locale | null;
        if (saved && ["en", "uz", "ru"].includes(saved)) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("locale", newLocale);
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
