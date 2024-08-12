// app/utils/translations.ts
export const translations = {
  en: {
    newsfeed: "NewsFeed",
    settings: "Settings",
    greeting: "Hello",
    changeLanguage: "Change Language",
  },
  th: {
    newsfeed: "ข่าวสาร",
    settings: "ตั้งค่า",
    greeting: "สวัสดี",
    changeLanguage: "Change Language",
  },
  fr: {
    newsfeed: "ข่าวสาร",
    settings: "ตั้งค่า",
    greeting: "สวัสดี",
    changeLanguage: "Change Language",
  },
};

export type TranslationKey = keyof typeof translations.en;
