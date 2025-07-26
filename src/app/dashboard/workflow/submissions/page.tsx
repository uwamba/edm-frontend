/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

type FieldType = 'text' | 'select' | 'checkbox' | 'radio' | 'file' | 'multiselect';

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
  type: FieldType;
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
  field: { id: number; name: string; label: string; type: string; options?: string[] };
  children?: Record<string, string>[]; // for nested children
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
    async function fetchData() {
      try {
        const res = await axios.get("http://localhost:8000/api/form/submissions/list");
        const rawSubs: Submission[] = res.data.data;

        
const enriched = await Promise.all(
  rawSubs.map(async (sub) => {
    let approval: ApprovalProcess | null = null;
    try {
      const apr = await axios.get<ApprovalProcess>(
        `http://localhost:8000/api/forms/${sub.form_id}/approval-process`
      );
      approval = apr.data;
    } catch {
      approval = null;
    }

    return {
      ...sub,
      form: {
        ...(sub.form ?? {}),
        approval_process: approval,
      } as Form,  // optional, if you want explicit typing
    };
  })
);

setSubmissions(enriched);

      } catch (err) {
        console.error("Failed to fetch submissions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggle = (id: number) => setSelectedId((prev) => (prev === id ? null : id));

  function renderFieldValue(sf: SubmittedField) {
  const type = sf.field.type; // assuming type exists in field

  if (type === "multiselect") {
    // Try parsing JSON or split by comma as fallback
    let values: string[] = [];
    console.log("Field mult select value:", sf.value);
    try {
      values = JSON.parse(sf.value);
      if (!Array.isArray(values)) values = [];
    } catch {
      values = sf.value.split(",").map(v => v.trim());
    }

    return (
      <div className="flex flex-wrap gap-2">
        {values.map((val, i) => (
          <span
            key={i}
            className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
          >
            {val}
          </span>
        ))}
      </div>
    );
  }

  if (type === "select") {
    // Just display the selected option
    return <span>{sf.value}</span>;
  }

  if (type === "checkbox") {
    return <span>{sf.value === "1" || sf.value === "true" ? "Yes" : "No"}</span>;
  }

  // fallback: just display string
  return <span>{sf.value}</span>;
}

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
          {submissions.map((submission) => {
            const apr = submission.form?.approval_process;
            return (
              <div key={submission.id} className="border p-4 rounded shadow-md hover:shadow-lg">
  <div className="flex justify-between items-center">
    <div>
      <h2 className="text-xl font-semibold">{submission.form?.title || "Untitled"}</h2>
      <p className="text-sm text-gray-600">
        Submitted by <strong>{submission.user?.name || "Unknown"}</strong> on{" "}
        {new Date(submission.created_at).toLocaleString()}
      </p>
    </div>
    <button onClick={() => toggle(submission.id)} className="underline text-blue-600">
      {selectedId === submission.id ? "Hide Details" : "View Details"}
    </button>
  </div>

  {selectedId === submission.id && (
    <div className="mt-4 space-y-4">
      <div>
        <strong>Description:</strong> {submission.form?.description || "-"}
      </div>

      <div>
        <strong>Submitted Values:</strong>
        {submission.fields?.length ? (
          <ul className="list-disc pl-5 mt-1 space-y-4">
            {submission.fields.map((field) => (
              <li key={field.id}>
                <div className="font-medium">
                  {field.field.label}: {renderFieldValue(field)}
                </div>

                {/* Render children if present */}
                {field.children && field.children.length > 0 ? (
                  <table className="w-full text-sm text-left border border-gray-300 mt-2">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        {[...new Set(field.children.map((c) => c.label))].map((label) => (
                          <th key={label} className="px-3 py-2">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const labels = [...new Set(field.children.map((c) => c.label))];
                        const groupSize = labels.length;
                        const rows = [];
                        for (let i = 0; i < field.children.length; i += groupSize) {
                          rows.push(field.children.slice(i, i + groupSize));
                        }
                        return rows.map((row, idx) => (
                          <tr key={idx} className="border-t border-gray-200">
                            {row.map((cell, i) => (
                              <td key={i} className="px-3 py-2">
                                {cell.value}
                              </td>
                            ))}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 italic">No child values submitted.</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <em className="text-gray-500 block mt-1">No fields submitted.</em>
        )}
      </div>

      <div>
        <strong>Approval Process:</strong>
        {submission.form?.approval_process?.steps?.length ? (
          <ul className="list-disc pl-5 mt-1">
            {submission.form.approval_process.steps.map((step) => (
              <li key={step.id} className="flex justify-between">
                <span>
                  Step {step.step_number}: <strong>{step.approver?.name || "Unknown"}</strong> ({step.approver?.email})
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
          <em className="text-gray-500 block mt-1">No approval process defined.</em>
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
