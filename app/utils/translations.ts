// app/utils/translations.ts
export const translations = {
  en: {
    newsfeed: "NewsFeed",
    settings: "Settings",
    greeting: "Hello",
    changeLanguage: "Change Language",
    notification: "Notification",
    preferences: "Preferences",
    about: "About",
    enable: "enable",
    disable: "disable",
    noschedule: "No schedule available",
    selectRoute: "Select a route",
    location: "use location",
    colorTheme: "Color Theme",
    light: "Light",
    dark: "Dark",
  },
  th: {
    newsfeed: "ข่าวสาร",
    settings: "ตั้งค่า",
    greeting: "สวัสดี",
    changeLanguage: "เปลี่ยนภาษา",
    notification: "แจ้งเตือน",
    preferences: "การจัดการ",
    about: "เกี่ยวกับ",
    enable: "เปิดใช้งาน",
    disable: "ปิดใช้งาน",
    noschedule: "ไม่มีตารางเดินรถตอนนี้",
    selectRoute: "เลือกเส้นทางเดินรถ",
    location: "การใช้ง่รตำแหน่ง",
    colorTheme: "สีธีม",
    light: "สว่าง",
    dark: "มืด",
  },
};

export type TranslationKey = keyof typeof translations.en;
