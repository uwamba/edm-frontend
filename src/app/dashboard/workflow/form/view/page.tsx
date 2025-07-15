"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import Link from "next/link";

interface Field {
  id: number;
  label: string;
  type: string;
  options?: string[];
  required: boolean;
  parentField?: string;
  parentMapping?: Record<string, string[]>;
}

interface ApprovalStep {
  id: number;
  step_number: number;
  approver: {
    id: number;
    name: string;
    email: string;
  };
  status: string;
}

interface ApprovalProcess {
  id: number;
  name: string;
  description: string;
  steps: ApprovalStep[];
}

interface Form {
  id: number;
  title: string;
  description: string;
  fields: Field[];
  approval_process?: ApprovalProcess | null;
}

export default function FormsList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/forms");
        const formsData: Form[] = response.data.data;

        // Fetch approval processes for each form
        const formsWithApproval = await Promise.all(
          formsData.map(async (form) => {
            try {
              const approvalRes = await axios.get(`http://localhost:8000/api/forms/${form.id}/approval-process`);
              return {
                ...form,
                approval_process: approvalRes.data, // Include approval process
              };
            } catch {
              return { ...form, approval_process: null }; // No approval process
            }
          })
        );

        setForms(formsWithApproval);
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleDelete = async (formId: number) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/forms/${formId}`);
      setForms(forms.filter((f) => f.id !== formId));
      alert("🗑️ Form deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete form.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-600">
        Loading forms...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-800">
        📋 All Forms
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className="p-4 bg-blue-100 border border-blue-300 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-blue-800">{form.title}</h2>
            <p className="text-blue-700 mt-1">{form.description || "No description"}</p>
            <p className="text-sm text-blue-600 mt-2">{form.fields.length} fields</p>

            {form.approval_process ? (
              <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded">
                <h3 className="text-green-700 font-medium">✅ Approval Process</h3>
                <p className="text-green-600">{form.approval_process.name}</p>
                <ul className="list-disc list-inside text-green-700 mt-2">
                  {form.approval_process.steps.map((step) => (
                    <li key={step.id}>
                      Step {step.step_number}: {step.approver.name} ({step.approver.email})
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Link
                href={{
                  pathname: "/dashboard/workflow/form/approval",
                  query: { formId: form.id },
                }}
                className="mt-3 inline-block bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                + Add Approval Process
              </Link>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/forms/edit/${form.id}`}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(form.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
