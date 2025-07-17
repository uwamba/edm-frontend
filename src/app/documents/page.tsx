"use client";

import { useTranslation } from "react-i18next";
import "@/i18n.client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useState } from "react";

export default function UploadPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage(t("edms.upload.select_file"));
      return;
    }

    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage(t("edms.upload.success"));
        setFile(null);
      } else {
        setMessage(t("edms.upload.error"));
      }
    } catch (err) {
      setMessage(t("edms.upload.error"));
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />

      <section className="flex-grow px-6 py-20 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">{t("edms.upload.title")}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">{t("edms.upload.choose_file")}</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full border border-gray-300 rounded px-4 py-2 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {message && (
            <div className="text-center text-sm text-blue-600 dark:text-blue-400">{message}</div>
          )}

          <div className="text-center">
            <button
              type="submit"
              className="px-8 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
            >
              {t("edms.upload.submit")}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}
