"use client";

import { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";

interface JobTitle {
  id: number;
  name: string;
}

export default function ApprovalProcessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("formId");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<
    { step_number: number; job_title_id: string }[]
  >([{ step_number: 1, job_title_id: "" }]);

  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobTitles = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/job-titles");
        setJobTitles(res.data);
      } catch (error) {
        console.error("Failed to fetch job titles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobTitles();
  }, []);

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { step_number: prev.length + 1, job_title_id: "" },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, job_title_id: string) => {
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index ? { ...step, job_title_id } : step
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
        form_id: parseInt(formId, 10),
        name,
        description,
        steps,
      };

      console.log("Submitting payload:", payload);

      await axios.post("http://localhost:8000/api/approval-processes", payload);

      alert("✅ Approval Process created successfully!");
      router.push("/dashboard/workflow/form/view");
    } catch (error: unknown) {
      console.error("Error creating approval process:", error);
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        alert(
          "❌ Validation failed: " +
            JSON.stringify(error.response.data.errors, null, 2)
        );
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
    <DashboardLayout>
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
            <label className="block text-blue-700 font-medium mb-1">
              Process Name
            </label>
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
            <label className="block text-blue-700 font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Approval Steps */}
          <div>
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Approval Steps
            </h2>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <span className="text-blue-700">Step {step.step_number}</span>
                <select
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={step.job_title_id}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  required
                >
                  <option value="">-- Select Job Title --</option>
                  {jobTitles.map((title) => (
                    <option key={title.id} value={title.id.toString()}>
                      {title.name}
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
    </DashboardLayout>
  );
}
