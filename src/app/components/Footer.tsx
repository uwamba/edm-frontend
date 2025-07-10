"use client";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-200 dark:bg-gray-900 text-center text-gray-700 dark:text-gray-400 py-8 mt-auto">
      <p>
        © {new Date().getFullYear()} {t("edms.footer.company_name")} — {t("edms.footer.rights")}
      </p>
    </footer>
  );
}
