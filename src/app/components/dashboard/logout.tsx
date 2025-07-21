"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);

    try {
      // Clear the token and user data from localStorage (or session, cookies)
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Optionally, make an API request to logout on the server-side (if needed)
      // await axios.post('/api/logout');

      // Redirect to the login page or home page
      router.push("/login"); // Or "/"
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
