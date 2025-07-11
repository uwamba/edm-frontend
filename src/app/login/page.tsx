"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Fake login validation (you should replace this with real API logic)
    if (email === "" || password === "") {
      setError(t("edms.login_form.error_message"));
    } else {
      setError("");
      console.log("Logging in with:", { email, password });
      // Redirect or further logic goes here
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
          {t("edms.login_form.title")}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
          {t("edms.login_form.description")}
        </p>

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
        )}

        <label className="block mb-4">
          <span className="text-gray-700 dark:text-gray-200">
            {t("edms.login_form.fields.email")}
          </span>
          <input
            type="email"
            required
            className="mt-1 block w-full px-4 py-2 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700 dark:text-gray-200">
            {t("edms.login_form.fields.password")}
          </span>
          <input
            type="password"
            required
            className="mt-1 block w-full px-4 py-2 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {t("edms.login_form.submit_button")}
        </button>
      </form>
    </div>
  );
}
