"use client";
import { useTranslation } from "react-i18next";
import "@/i18n.client";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />

      <section className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">{t("edms.click_here")}</h2>
        <p className="text-lg md:text-xl mb-10 max-w-3xl">{t("edms.description")}</p>

        <div className="flex gap-6 flex-wrap justify-center">
          <a
            href="/documents"
            className="px-8 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
          >
            {t("edms.view_documents")}
          </a>
          <a
            href="/documents/upload"
            className="px-8 py-3 rounded border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition font-semibold"
          >
            {t("edms.upload_document")}
          </a>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <h2 className="text-2xl font-bold mb-3">{t("edms.features.easy_upload.title")}</h2>
            <p>{t("edms.features.easy_upload.description")}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">{t("edms.features.secure_storage.title")}</h2>
            <p>{t("edms.features.secure_storage.description")}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">{t("edms.features.quick_search.title")}</h2>
            <p>{t("edms.features.quick_search.description")}</p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold mb-6">{t("edms.benefits.title")}</h2>
        <ul className="list-disc list-inside space-y-3 text-lg max-w-xl mx-auto">
          <li>{t("edms.benefits.organize_documents")}</li>
          <li>{t("edms.benefits.increase_productivity")}</li>
          <li>{t("edms.benefits.ensure_compliance")}</li>
          <li>{t("edms.benefits.easy_access")}</li>
        </ul>
      </section>

      <Footer />
    </main>
  );
}
