"use client"; 

import { useEffect, useState } from "react";
import Sidebar from "./dashboard/Sidebar";
import Link from "next/link";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import "@/i18n.client";
import LogoutButton from "@/app/components/dashboard/logout"; // Import the LogoutButton component

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Ensure localStorage is accessed only on the client-side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token); // If token exists, the user is authenticated
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header
          className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center"
          aria-label="Dashboard Header"
        >
          <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {t("edms.home")}
            </Link>
            <LanguageSwitcher />

            {/* Only render LogoutButton if user is authenticated */}
            {isAuthenticated && <LogoutButton />}
          </div>
        </header>

        <main className="p-6">
          {children} {/* This will render the child components */}
        </main>
      </div>
    </div>
  );
}
