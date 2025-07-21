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
  const [openWorkflow, setOpenWorkflow] = useState(true);
  const [openDocument, setOpenDocument] = useState(true);
  const [openUsers, setOpenUsers] = useState(true);


  const WorkFlowItems = [
    {
      slug: "/dashboard/workflow/form/new",
      name: t("edms.forms.create_new_form", "Create New Form"),
      icon: <FaWpforms />,
    },
    {
      slug: "/dashboard/workflow/form/view",
      name: t("edms.forms.view_forms", "View Forms"),
      icon: <FaList />,
    },
    {
      slug: "/dashboard/workflow/submissions",
      name: t("edms.forms.submit_form", "Form Submissions"),
      icon: <FaList />,
    },
  ];

  const UserItems = [
    {
      slug: "/dashboard/user/create",
      name: t("edms.users.add_user", "Create User"),
      icon: <FaUsers />,
    },
    {
      slug: "/dashboard/user/list",
      name: t("edms.users.view_users", "View Users"),
      icon: <FaUsers />,
    },
  
    

  ];

  const documentItems = [
    {
      slug: "upload",
      name: t("edms.documents.upload_document", "Upload Document"),
      icon: <FaUpload />,
    },
    {
      slug: "view",
      name: t("edms.documents.view_documents", "View Documents"),
      icon: <FaFileAlt />,
    },
  ];

  return (
    <aside className="w-72 bg-white dark:bg-gray-800 h-screen p-4 border-r dark:border-gray-700 overflow-y-auto flex flex-col justify-between">
      <div>
        {/* User Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t("edms.users.users", "Users")}
          </h2>
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={() => setOpenUsers(!openUsers)}
          >
            <span className="flex items-center gap-2">
              <FaUsers />
              {t("edms.users.users", "Users")}
            </span>
            {openUsers ? <FaChevronDown /> : <FaChevronRight />}
          </button> 
          {openUsers && (
            <nav className="flex flex-col gap-1 mt-2 ml-4">
              {UserItems.map((item) => (
                <Link
                  key={item.slug}
                  href={item.slug}
                  className={`text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition ${
                    pathname === item.slug
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
        </div>  
        
        {/* workflow Section */}
        <button
          className="w-full flex items-center justify-between px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          onClick={() => setOpenWorkflow(!openWorkflow)}
        >
          <span className="flex items-center gap-2">
            <FaBuilding />
            {t("edms.workflow.workflow", "WorkFlow")}
          </span>
          {openWorkflow ? <FaChevronDown /> : <FaChevronRight />}
        </button>

      

        {openWorkflow && (
          <nav className="flex flex-col gap-1 mt-2 ml-4">
            {WorkFlowItems.map((item) => (
              <Link
                key={item.slug}
                href={`${item.slug}`}
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
      </div>

      {/* Language Switcher */}
      <div className="mt-6 border-t pt-4">
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
