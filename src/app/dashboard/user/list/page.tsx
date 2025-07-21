"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import axiosInstance from "@/app/lib/api";
import DashboardLayout from "@/app/components/DashboardLayout";

interface User {
    id: number;
    name: string;
    email: string;
    job_title?: string;
    manager?: { id: number; name: string };
    company?: { id: number; name: string };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);



    useEffect(() => {
        const fetchProfile = async () => {
          try {
            const response = await axiosInstance.get('/users');
            setUsers(response.data); // Set profile data in state
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        };
    
        fetchProfile();
      }, []);


    const handleDelete = async (id: number) => {
        if (confirm("Are you sure to delete this user?")) {
            await axios.delete(`http://localhost:8000/api/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        }
    };



    return (
    <DashboardLayout>
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">👥 User Management</h1>

            <Link
                href="/dashboard/user/create"
                className="inline-block mb-4 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            >
                ➕ Add User
            </Link>

            <table className="w-full border">
                <thead className="bg-blue-50">
                    <tr>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Email</th>
                        <th className="p-2 border">Job Title</th>
                        <th className="p-2 border">Manager</th>
                        <th className="p-2 border">Company</th>
                        <th className="p-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="p-2 border">{user.name}</td>
                            <td className="p-2 border">{user.email}</td>
                            <td className="p-2 border">{user.job_title}</td>
                            <td className="p-2 border">{user.manager?.name}</td>
                            <td className="p-2 border">{user.company?.name}</td>
                            <td className="p-2 border space-x-2">

                                <Link
                                    href={`/dashboard/users/view?id=${user.id}`}
                                    className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                >
                                    View
                                </Link>
                                <Link
                                    href={`/dashboard/users/edit?id=${user.id}`}
                                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </Link>

                               
                              
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </DashboardLayout>
    );
    
}
