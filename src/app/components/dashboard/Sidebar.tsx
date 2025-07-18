"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  FaChevronDown,
  FaChevronRight,
  FaBuilding,
  FaWpforms,
  FaList,
  FaUpload,
  FaFileAlt,
  FaUsers,
} from "react-icons/fa";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [openOffice, setOpenOffice] = useState(true);
  const [openDocument, setOpenDocument] = useState(true);

  const officeItems = [
    {
      slug: "new",
      name: t("edms.form.new_document", "New Form"),
      icon: <FaWpforms />,
    },
    {
      slug: "view",
      name: t("edms.form.view_documents", "View Forms"),
      icon: <FaList />,
    },
  ];

  const documentItems = [
    {
      slug: "upload",
      name: "Upload Document",
      icon: <FaUpload />,
    },
    {
      slug: "view",
      name: "View Documents",
      icon: <FaFileAlt />,
    },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-gray-800 h-screen p-4 border-r dark:border-gray-700 overflow-y-auto flex flex-col justify-between">
      <div>
        {/* Office Section */}
        <button
          className="w-full flex items-center justify-between px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => setOpenOffice(!openOffice)}
        >
          <span className="flex items-center gap-2">
            <FaBuilding />
            {t("edms.offices.office", "Office")}
          </span>
          {openOffice ? <FaChevronDown /> : <FaChevronRight />}
        </button>

        {openOffice && (
          <nav className="flex flex-col gap-1 mt-2 ml-4">
            {officeItems.map((item) => (
              <Link
                key={item.slug}
                href={`/dashboard/workflow/form/${item.slug}`}
                className={`text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition ${
                  pathname === `/dashboard/workflow/form/${item.slug}`
                    ? "bg-blue-500 text-white"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        )}

        {/* Document Section */}
        <button
          className="w-full flex items-center justify-between px-4 py-2 mt-4 text-left font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => setOpenDocument(!openDocument)}
        >
          <span className="flex items-center gap-2">
            <FaFileAlt />
            Document
          </span>
          {openDocument ? <FaChevronDown /> : <FaChevronRight />}
        </button>

        {openDocument && (
          <nav className="flex flex-col gap-1 mt-2 ml-4">
            {documentItems.map((item) => (
              <Link
                key={item.slug}
                href={`/dashboard/documents/${item.slug}`}
                className={`text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition ${
                  pathname === `/dashboard/documents/${item.slug}`
                    ? "bg-blue-500 text-white"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        )}

        

        {/* Submissions Link */}
        <nav className="flex flex-col gap-1 mt-2 ml-4">
          <Link
            href={`/dashboard/workflow/submissions`}
            className={`text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition ${
              pathname === `/dashboard/workflow/submissions`
                ? "bg-blue-500 text-white"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            <span className="text-base">
              <FaList />
            </span>
            <span>Submissions</span>
          </Link>
        </nav>

        {/* Users Link */}
        <nav className="flex flex-col gap-1 mt-2 ml-4">
          <Link
            href={`/dashboard/user/list`}
            className={`text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition ${
              pathname === `/dashboard/user/list`
                ? "bg-blue-500 text-white"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            <span className="text-base">
              <FaUsers />
            </span>
            <span>Users</span>
          </Link>
        </nav>
      </div>

      {/* Language Switcher */}
      <div className="mt-6 border-t pt-4">
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
