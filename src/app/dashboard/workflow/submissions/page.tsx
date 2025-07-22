/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

interface ApprovalStep {
  id: number;
  step_number: number;
  status: string;
  approver: { id: number; name: string; email: string } | null;
}

interface ApprovalProcess {
  steps: ApprovalStep[];
}

interface Field {
  id: number;
  name: string;
  label: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  job_title: string;
}

interface Form {
  id: number;
  title: string;
  description: string;
  fields: Field[];
  creator?: User;
  approval_process?: ApprovalProcess | null;
}

interface SubmittedField {
  id: number;
  value: string;
  field: { id: number; name: string; label: string };
}

interface Submission {
  id: number;
  form_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: User;
  form?: Form;
  fields?: SubmittedField[];
}

export default function SubmissionsList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/form/submissions/list");
        const rawSubs: Submission[] = res.data.data;

        const enriched = await Promise.all(
          rawSubs.map(async (sub) => {
            const enrichedSub: Submission = { ...sub };
            let approval: ApprovalProcess | null = null;

            try {
              const apr = await axios.get<ApprovalProcess>(
                `http://localhost:8000/api/forms/${sub.form_id}/approval-process`
              );
              approval = apr.data;
            } catch {
              approval = null;
            }

            enrichedSub.form = { ...(sub.form as Form), approval_process: approval };
            return enrichedSub;
          })
        );

        setSubmissions(enriched);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggle = (id: number) => setSelectedId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading submissions...
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">📋 Submitted Forms</h1>
        <div className="space-y-4">
          {submissions.map((s) => {
            const apr = s.form?.approval_process;
            return (
              <div key={s.id} className="border p-4 rounded shadow-md hover:shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{s.form?.title || "Untitled"}</h2>
                    <p className="text-sm text-gray-600">
                      Submitted by <strong>{s.user?.name || "Unknown"}</strong> on{" "}
                      {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => toggle(s.id)}
                    className="underline text-blue-600"
                  >
                    {selectedId === s.id ? "Hide Details" : "View Details"}
                  </button>
                </div>

                {selectedId === s.id && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <strong>Description:</strong> {s.form?.description || "-"}
                    </div>

                    <div>
                      <strong>Submitted Values:</strong>
                      {s.fields?.length ? (
                        <ul className="list-disc pl-5 mt-1">
                          {s.fields.map((sf) => (
                            <li key={sf.id}>
                              {sf.field.label}: {sf.value}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <em className="text-gray-500 block mt-1">No fields submitted.</em>
                      )}
                    </div>

                    <div>
                      <strong>Approval Process:</strong>
                      {apr?.steps?.length ? (
                        <ul className="list-disc pl-5 mt-1">
                          {apr.steps.map((step) => (
                            <li key={step.id} className="flex justify-between">
                              <span>
                                Step {step.step_number}:{" "}
                                <strong>{step.approver?.name || "Unknown"}</strong>{" "}
                                ({step.approver?.email})
                              </span>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  step.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : step.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {step.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <em className="text-gray-500 block mt-1">
                          No approval process defined.
                        </em>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
