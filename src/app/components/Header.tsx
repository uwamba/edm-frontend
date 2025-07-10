"use client";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function Header() {
  const { t } = useTranslation();

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
          <Link href="/support" className="text-gray-800 dark:text-gray-200 hover:underline">
            {t("edms.support")}
          </Link>
          <Link href="/login" className="text-gray-800 dark:text-gray-200 hover:underline">
            {t("edms.login")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
