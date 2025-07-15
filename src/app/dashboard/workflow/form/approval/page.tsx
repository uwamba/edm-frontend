"use client";

import { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function ApprovalProcessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId"); // 👈 Get ?form_id=123 from URL

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<{ step_number: number; approver_id: number }[]>([
    { step_number: 1, approver_id: 0 },
  ]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/users");
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { step_number: prev.length + 1, approver_id: 0 },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, approver_id: number) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, approver_id } : step
      )
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formId) {
      alert("❌ Missing form_id in URL");
      return;
    }

    try {
      const payload = {
        form_id: parseInt(formId, 10), // 👈 convert to int
        name,
        description,
        steps,
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post("http://localhost:8000/api/approval-processes", payload);

      alert("✅ Approval Process created successfully!");
      router.push("/dashboard/workflow/form/view");
    } catch (error: any) {
      console.error("Error creating approval process:", error);
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        alert("❌ Validation failed: " + JSON.stringify(error.response.data.errors));
      } else {
        alert("❌ Failed to create approval process.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-blue-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">
        📝 Create Approval Process
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl space-y-4"
      >
        {/* Process Name */}
        <div>
          <label className="block text-blue-700 font-medium mb-1">Process Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-blue-700 font-medium mb-1">Description</label>
          <textarea
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Approval Steps */}
        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Approval Steps</h2>
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 mb-2"
            >
              <span className="text-blue-700">Step {step.step_number}</span>
              <select
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={step.approver_id}
                onChange={(e) =>
                  handleStepChange(index, parseInt(e.target.value))
                }
                required
              >
                <option value={0}>-- Select Approver --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStep(index)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddStep}
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            + Add Step
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          ✅ Save Approval Process
        </button>
      </form>
    </div>
  );
}
