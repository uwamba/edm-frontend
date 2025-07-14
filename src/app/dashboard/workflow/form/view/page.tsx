"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface Field {
  id: number;
  label: string;
  type: string;
  options?: string[];
  required: boolean;
  parentField?: string;
  parentMapping?: Record<string, string[]>;
}

interface Form {
  id: number;
  title: string;
  description: string;
  fields: Field[];
}

export default function FormsList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [responses, setResponses] = useState<{ [fieldId: number]: any }>({});
  const [childOptions, setChildOptions] = useState<{ [fieldId: number]: string[] }>({});

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/forms");
        setForms(response.data.data);
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleInputChange = (field: Field, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value: any;

    if (field.type === "checkbox") {
      value = (e.target as HTMLInputElement).checked;
    } else if (field.type === "file") {
      const files = (e.target as HTMLInputElement).files;
      value = files && files.length > 0 ? files[0] : null;
    } else {
      value = e.target.value;
    }

    setResponses((prev) => ({ ...prev, [field.id]: value }));

    // Handle child fields for nested selects
    selectedForm?.fields.forEach((f) => {
      if (f.parentField === field.label && f.parentMapping) {
        const key = String(value);
        const mappedOptions = f.parentMapping[key] || [];
        setChildOptions((prev) => ({
          ...prev,
          [f.id]: mappedOptions,
        }));
        setResponses((prev) => ({
          ...prev,
          [f.id]: "",
        }));
      }
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;

    // Use FormData to support file uploads
    const formData = new FormData();
    formData.append("form_id", String(selectedForm.id));

    // Append each field with key 'field_<id>'
    Object.entries(responses).forEach(([fieldId, value]) => {
      const key = `field_${fieldId}`;
      if (value instanceof File) {
        formData.append(`data[${key}]`, value);
      } else {
        formData.append(`data[${key}]`, value ?? "");
      }
    });

    try {
      await axios.post(
        `http://localhost:8000/api/form/submissions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );


      alert("✅ Form submitted successfully!");
      setSelectedForm(null);
      setResponses({});
      setChildOptions({});
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        console.error("Validation Errors:", error.response.data.errors);
        alert("❌ Validation failed: " + JSON.stringify(error.response.data.errors));
      } else {
        console.error("Error submitting form:", error);
        alert("❌ Failed to submit form.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading forms...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        📋 All Forms
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {forms.map((form) => (
          <div
            key={form.id}
            className="p-4 bg-white shadow rounded-lg hover:shadow-lg transition cursor-pointer border border-gray-200"
            onClick={() => {
              setSelectedForm(form);
              setResponses({});
              setChildOptions({});
            }}
          >
            <h2 className="text-xl font-semibold text-gray-800">{form.title}</h2>
            <p className="text-gray-500 mt-1">
              {form.description?.slice(0, 100) || "No description"}
            </p>
            <p className="text-sm text-gray-400 mt-2">{form.fields.length} fields</p>
          </div>
        ))}
      </div>

      {/* Fill Form Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl"
              onClick={() => setSelectedForm(null)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedForm.title}</h2>
            <p className="text-gray-600 mb-4">{selectedForm.description}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedForm.fields.map((field) => (
                <div key={field.id}>
                  <label className="block font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {/* Render field types */}
                  {field.type === "text" && (
                    <input
                      type="text"
                      className="w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter text"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                    />
                  )}
                  {field.type === "number" && (
                    <input
                      type="number"
                      className="w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter number"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                    />
                  )}
                  {field.type === "select" && (
                    <select
                      className="w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                      value={responses[field.id] || ""}
                    >
                      <option value="">-- Select --</option>
                      {(field.parentField
                        ? childOptions[field.id] || []
                        : field.options || []
                      ).map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  {field.type === "checkbox" && (
                    <div className="flex items-center mt-1">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={responses[field.id] || false}
                        onChange={(e) => handleInputChange(field, e)}
                      />
                      <span className="text-gray-700">Check if applicable</span>
                    </div>
                  )}
                  {field.type === "date" && (
                    <input
                      type="date"
                      className="w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                    />
                  )}
                  {field.type === "file" && (
                    <input
                      type="file"
                      className="w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:ring-2 focus:ring-green-400 transition"
              >
                ✅ Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
