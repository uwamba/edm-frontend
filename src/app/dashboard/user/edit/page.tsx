"use client";

import { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
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

interface FormData {
  name: string;
  email: string;
  password?: string; // optional here
  job_title_id: string;
  company_id: string;
  manager_id: string;
}

export default function EditUser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "", // blank means no password change
    job_title_id: "",
    company_id: "",
    manager_id: "",
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State for creating job title
  const [showJobTitleModal, setShowJobTitleModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [jobTitleSubmitting, setJobTitleSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [userRes, usersRes, companiesRes, jobTitlesRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/users/${id}`),
          axios.get("http://localhost:8000/api/users"),
          axios.get("http://localhost:8000/api/companies"),
          axios.get("http://localhost:8000/api/job-titles"),
        ]);

        const user = userRes.data;
        setForm({
          name: user.name || "",
          email: user.email || "",
          password: "", // don't prefill password
          job_title_id: user.job_title?.id?.toString() ?? "",
          company_id: user.company?.id?.toString() ?? "",
          manager_id: user.manager?.id?.toString() ?? "",
        });

        setUsers(usersRes.data);
        setCompanies(companiesRes.data);
        setJobTitles(jobTitlesRes.data ?? jobTitlesRes.data);
      } catch (error) {
        console.error("Failed to load user data:", error);
        alert("❌ Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: any = { ...form };
      if (!payload.password) {
        delete payload.password;
      }

      await axios.put(`http://localhost:8000/api/users/${id}`, payload);
      alert("✅ User updated successfully!");
      router.push("/dashboard/user/list");
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        alert(
          "❌ Validation errors:\n" + JSON.stringify(error.response.data.errors)
        );
      } else {
        alert("❌ Failed to update user.");
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for job title creation
  const openJobTitleModal = () => setShowJobTitleModal(true);
  const closeJobTitleModal = () => {
    setShowJobTitleModal(false);
    setNewJobTitle("");
  };

  const handleJobTitleCreate = async () => {
    if (!newJobTitle.trim()) {
      alert("Job title cannot be empty.");
      return;
    }
    setJobTitleSubmitting(true);

    try {
      const res = await axios.post("http://localhost:8000/api/job-titles", {
        name: newJobTitle.trim(),
      });
      // Add new job title to list and select it
      setJobTitles((prev) => [...prev, res.data]);
      setForm((prev) => ({ ...prev, job_title_id: res.data.id.toString() }));
      closeJobTitleModal();
    } catch (error) {
      console.error("Failed to create job title:", error);
      alert("❌ Failed to create job title.");
    } finally {
      setJobTitleSubmitting(false);
    }
  };

  if (loading) return <p className="p-6 text-blue-700">Loading user data...</p>;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-blue-50 p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">✏️ Edit User</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password (leave blank to keep current)"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center space-x-2">
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
              onClick={openJobTitleModal}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
              + Add Job Title
            </button>
          </div>

          <select
            name="company_id"
            value={form.company_id}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Company --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="manager_id"
            value={form.manager_id}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Manager --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "💾 Save Changes"}
          </button>
        </form>

        {/* Job Title creation modal */}
        {showJobTitleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-80">
              <h2 className="text-xl font-semibold mb-4">➕ Add Job Title</h2>
              <input
                type="text"
                placeholder="Job Title Name"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeJobTitleModal}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJobTitleCreate}
                  disabled={jobTitleSubmitting}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  type="button"
                >
                  {jobTitleSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
