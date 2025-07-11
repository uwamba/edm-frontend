"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FaChevronDown,
  FaChevronRight,
  FaBuilding,
  FaLaptop,
  FaSearch,
} from "react-icons/fa";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const departments = [
    {
      slug: "upload",
      name: t("edms.upload_document", "Upload"),
      icon: <FaLaptop />,
    },
    {
      slug: "search",
      name: t("edms.view_documents", "Search"),
      icon: <FaSearch />,
    },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-gray-800 h-screen p-4 border-r dark:border-gray-700 overflow-y-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <button
          className="w-full flex items-center justify-between px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => setOpen(!open)}
        >
          <span className="flex items-center gap-2">
            <FaBuilding />
            {t("edms.offices.presidential_office", "Presidential Office")}
          </span>
          {open ? <FaChevronDown /> : <FaChevronRight />}
        </button>

        {/* Department Links */}
        {open && (
          <nav className="flex flex-col gap-1 mt-2 ml-4">
            {departments.map((dept) => (
              <Link
                key={dept.slug}
                href={`/dashboard/presidential/${dept.slug}`}
                className={`text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition ${
                  pathname === `/dashboard/presidential/${dept.slug}`
                    ? "bg-blue-500 text-white"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                <span className="text-base">{dept.icon}</span>
                <span>{dept.name}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Language Switcher at Bottom */}
      <div className="mt-6 border-t pt-4">
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
