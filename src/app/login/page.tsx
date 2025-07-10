"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Logging in with:", email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {t("login_form.title", "Login to EDMS")}
        </h2>

        <label className="block mb-4">
          <span className="text-gray-700 dark:text-gray-200">{t("edms.register_form.fields.email")}</span>
          <input
            type="email"
            required
            className="mt-1 block w-full px-4 py-2 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700 dark:text-gray-200">{t("edms.register_form.fields.password")}</span>
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
          {t("edms.menu.login")}
        </button>
      </form>
    </div>
  );
}
