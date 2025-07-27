"use client";

import { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";

interface Company {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}
interface JobTitle {
  id: number;
  name: string;
}

export default function CreateUser() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    job_title_id: "",
    company_id: "",
    manager_id: "",
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showJobTitleModal, setShowJobTitleModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [creatingJobTitle, setCreatingJobTitle] = useState(false);

  useEffect(() => {
    if (showJobTitleModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showJobTitleModal]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, companiesRes, jobTitlesRes] = await Promise.all([
          axios.get("http://localhost:8000/api/users"),
          axios.get("http://localhost:8000/api/companies"),
          axios.get("http://localhost:8000/api/job-titles"),
        ]);
        setUsers(usersRes.data);
        setCompanies(companiesRes.data);
        setJobTitles(jobTitlesRes.data.data ?? jobTitlesRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("http://localhost:8000/api/users", form);
      alert("✅ User created successfully!");
      router.push("/dashboard/user/list");
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        alert(
          "❌ Validation errors:\n" + JSON.stringify(error.response.data.errors)
        );
      } else {
        alert("❌ Failed to create user.");
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateJobTitle = async (e: FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) {
      alert("Job Title cannot be empty");
      return;
    }

    setCreatingJobTitle(true);
    try {
      const res = await axios.post("http://localhost:8000/api/job-titles", {
        name: newJobTitle.trim(),
      });
      const newTitle = res.data.data ?? res.data;
      setJobTitles((prev) => [...prev, newTitle]);
      setForm((prev) => ({ ...prev, job_title_id: newTitle.id.toString() }));
      setNewJobTitle("");
      setShowJobTitleModal(false);
      alert("✅ Job title created!");
    } catch (error) {
      console.error("Failed to create job title:", error);
      alert("❌ Failed to create job title.");
    } finally {
      setCreatingJobTitle(false);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-blue-700 font-semibold text-center">Loading...</p>
    );

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-blue-50 p-8 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-8 tracking-wide">
          ➕ Create New User
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg space-y-6"
          aria-label="Create new user form"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition"
            />
          </div>

          {/* Job Title + Add button */}
          <div>
            <label
              htmlFor="job_title_id"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Job Title
            </label>
            <div className="flex items-center gap-3">
              <select
              name="job_title_id"
              value={form.job_title_id}
              onChange={handleChange}
              required
              className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Job Title --</option>
              {jobTitles.map((jt) => (
                <option key={jt.id} value={jt.id}>
                  {jt.name}
                </option>
              ))}
            </select>
              <button
                type="button"
                onClick={() => setShowJobTitleModal(true)}
                aria-label="Add new job title"
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-3 focus:ring-blue-500 transition"
              >
                + Add
              </button>
            </div>
            <p
              id="addJobTitleHelp"
              className="mt-1 text-xs text-gray-500 italic"
            >
              Can't find a job title? Add one.
            </p>
          </div>

          {/* Company */}
          <div>
            <label
              htmlFor="company_id"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Company (optional)
            </label>
            <select
              id="company_id"
              name="company_id"
              value={form.company_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition"
            >
              <option value="">-- Select Company --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Manager */}
          <div>
            <label
              htmlFor="manager_id"
              className="block mb-1 text-sm font-semibold text-gray-700"
            >
              Manager (optional)
            </label>
            <select
              id="manager_id"
              name="manager_id"
              value={form.manager_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition"
            >
              <option value="">-- Select Manager --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-3 focus:ring-green-500 transition disabled:opacity-50"
          >
            {submitting ? "Saving..." : "✅ Create User"}
          </button>
        </form>

        {/* Job Title Modal */}
        {showJobTitleModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
            onClick={() => setShowJobTitleModal(false)}
          >
            <div
              className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id="modalTitle"
                className="text-2xl font-bold text-gray-900 mb-5"
              >
                ➕ Add New Job Title
              </h2>
              <form onSubmit={handleCreateJobTitle} className="space-y-5">
                <label
                  htmlFor="newJobTitle"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Job Title
                </label>
                <input
                  id="newJobTitle"
                  type="text"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowJobTitleModal(false)}
                    className="px-5 py-3 rounded border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-3 focus:ring-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingJobTitle}
                    className="px-5 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-3 focus:ring-blue-500 transition disabled:opacity-50"
                  >
                    {creatingJobTitle ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
