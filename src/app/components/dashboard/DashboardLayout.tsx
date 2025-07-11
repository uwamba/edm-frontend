"use client"; // 👈 must be first line

import Sidebar from "./Sidebar";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function DashboardLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:underline">
              {t("edms.home")}
            </Link>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t("dashboard.welcome")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <h3 className="font-semibold text-lg mb-2">{t("dashboard.total_documents")}</h3>
              <p className="text-3xl">128</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <h3 className="font-semibold text-lg mb-2">{t("dashboard.pending_approvals")}</h3>
              <p className="text-3xl">5</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
              <h3 className="font-semibold text-lg mb-2">{t("dashboard.users")}</h3>
              <p className="text-3xl">27</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
