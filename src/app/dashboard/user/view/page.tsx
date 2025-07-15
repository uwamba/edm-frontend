"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export default function ViewUser() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:8000/api/users/${id}`)
      .then(res => setUser(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading user...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">👤 User Details</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Job Title:</strong> {user.job_title}</p>
      <p><strong>Company:</strong> {user.company?.name}</p>
      <p><strong>Manager:</strong> {user.manager?.name}</p>
    </div>
  );
}
