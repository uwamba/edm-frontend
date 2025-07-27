/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";

interface User {
  id: number;
  name: string;
  email: string;
  role?: { id: number; name: string };
  company?: { id: number; name: string };
  manager?: { id: number; name: string };
}

export default function ViewUser() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`http://localhost:8000/api/users/${id}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading user...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">👤 User Details</h1>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role?.name ?? "-"}
        </p>
        <p>
          <strong>Company:</strong> {user.company?.name ?? "-"}
        </p>
        <p>
          <strong>Manager:</strong> {user.manager?.name ?? "-"}
        </p>
      </div>
    </DashboardLayout>
  );
}
