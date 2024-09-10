import React, { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Language = "en" | "th"; // Add more languages as needed

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  const handleLanguageChange = async (lang: Language) => {
    try {
      await AsyncStorage.setItem("selectedLanguage", lang);
      setLanguage(lang);
    } catch (e) {
      console.error("Error saving language setting:", e);
    }
  };

  const loadLanguageSetting = async () => {
    try {
      const value = await AsyncStorage.getItem("selectedLanguage");
      if (value !== null) {
        setLanguage(value as Language);
      }
    } catch (e) {
      console.error("Error loading language setting:", e);
    }
  };

  React.useEffect(() => {
    loadLanguageSetting();
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleLanguageChange }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
