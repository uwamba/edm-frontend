"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface Field {
  id: number;
  label: string;
  type: string;
  options: string[];
  required: boolean;
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
    setResponses({
      ...responses,
      [field.id]: field.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/api/forms/${selectedForm?.id}/submissions`, {
        responses,
      });
      alert("Form submitted successfully!");
      setSelectedForm(null);
      setResponses({});
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form.");
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
            className="p-4 bg-white shadow rounded-lg hover:shadow-lg transition cursor-pointer"
            onClick={() => {
              setSelectedForm(form);
              setResponses({}); // reset responses
            }}
          >
            <h2 className="text-xl font-semibold text-gray-700">{form.title}</h2>
            <p className="text-gray-500 mt-1">
              {form.description?.slice(0, 100) || "No description"}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {form.fields.length} fields
            </p>
          </div>
        ))}
      </div>

      {/* Fill Form Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
              onClick={() => setSelectedForm(null)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedForm.title}
            </h2>
            <p className="text-gray-600 mb-4">{selectedForm.description}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedForm.fields.map((field) => (
                <div key={field.id}>
                  <label className="block font-medium text-gray-700">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {field.type === "text" && (
                    <input
                      type="text"
                      className="w-full p-2 border rounded bg-gray-50 mt-1"
                      placeholder="Enter text"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                    />
                  )}
                  {field.type === "number" && (
                    <input
                      type="number"
                      className="w-full p-2 border rounded bg-gray-50 mt-1"
                      placeholder="Enter number"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                    />
                  )}
                  {field.type === "select" && (
                    <select
                      className="w-full p-2 border rounded bg-gray-50 mt-1"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                    >
                      <option value="">-- Select --</option>
                      {field.options.map((option, idx) => (
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
                        onChange={(e) => handleInputChange(field, e)}
                      />
                      <span>Check if applicable</span>
                    </div>
                  )}
                  {field.type === "date" && (
                    <input
                      type="date"
                      className="w-full p-2 border rounded bg-gray-50 mt-1"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                    />
                  )}
                  {field.type === "file" && (
                    <input
                      type="file"
                      className="w-full p-2 border rounded bg-gray-50 mt-1"
                      required={field.required}
                      onChange={(e) => handleInputChange(field, e)}
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
