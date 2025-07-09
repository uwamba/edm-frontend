"use client";

import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-3 justify-center sm:justify-start">
      {["en", "fr"].map((lng) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={`px-3 py-1 rounded border ${
            i18n.language === lng
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
          } hover:bg-blue-600 hover:text-white transition`}
          aria-label={`Change language to ${lng}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
