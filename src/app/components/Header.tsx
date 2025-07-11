"use client";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import i18n from "@/i18n.client"; // adjust if path differs

export default function Header() {
  const { t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("edms.nam")}
        </h1>

        <nav className="flex gap-6 items-center">
          <Link href="/" className="text-gray-800 dark:text-gray-200 hover:underline">
            {t("edms.home")}
          </Link>
          <Link href="/" className="text-gray-800 dark:text-gray-200 hover:underline">
            {t("edms.register")}
          </Link>
          <Link href="/support" className="text-gray-800 dark:text-gray-200 hover:underline">
            {t("edms.support")}
          </Link>
          <Link href="/login" className="text-gray-800 dark:text-gray-200 hover:underline">
            {t("edms.login")}
          </Link>

          {/* Language Switcher Dropdown */}
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            defaultValue={i18n.language}
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>
        </nav>
      </div>
    </header>
  );
}
