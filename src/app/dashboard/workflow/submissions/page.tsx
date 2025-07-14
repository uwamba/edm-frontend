"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import SubmissionDetails from "@/app/components/dashboard/SubmissionDetails";



interface Submission {
  id: number;
  form_id: number;
  user_id: number;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Paste SubmissionDetails here or import it

export default function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/form/submissions/list");
        setSubmissions(res.data.data);
      } catch (err) {
        console.error("Failed to load submissions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading submissions...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Submitted Forms</h1>
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="p-4 border rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">Form ID: {submission.form_id}</h2>
            <p>User ID: {submission.user_id}</p>
            <p className="text-gray-500">
              Submitted at: {new Date(submission.created_at).toLocaleString()}
            </p>

            <button
              onClick={() =>
                setSelectedSubmissionId((prev) =>
                  prev === submission.id ? null : submission.id
                )
              }
              className="text-blue-600 underline mt-2"
            >
              {selectedSubmissionId === submission.id ? "Hide Details" : "View Details"}
            </button>

            {/* Show details inline if this submission is selected */}
            {selectedSubmissionId === submission.id && <SubmissionDetails id={submission.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
