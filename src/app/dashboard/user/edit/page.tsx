"use client";

import { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
    id: number;
    name: string;
    email: string;
    job_title?: string;
    manager?: { id: number; name: string };
    company?: { id: number; name: string };
}
export default function EditUser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [form, setForm] = useState({
    name: "",
    email: "",
    job_title: "",
    company_id: "",
    manager_id: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:8000/api/users/${id}`);
        const user = userRes.data;

        setForm({
          name: user.name,
          email: user.email,
          job_title: user.job_title,
          company_id: user.company?.id || "",
          manager_id: user.manager?.id || "",
        });

        const usersRes = await axios.get("http://localhost:8000/api/users");
        const companiesRes = await axios.get("http://localhost:8000/api/companies");
        setUsers(usersRes.data);
        setCompanies(companiesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await axios.put(`http://localhost:8000/api/users/${id}`, form);
    alert("✅ User updated");
    router.push("/users");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">✏️ Edit User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="job_title"
          placeholder="Job Title"
          value={form.job_title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <select
          name="company_id"
          value={form.company_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Company --</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          name="manager_id"
          value={form.manager_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Manager --</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ✅ Save Changes
        </button>
      </form>
    </div>
  );
}
