"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

type Field = {
  id: number;
  label: string;
  type: string;
  required: boolean;
  options?: string[]; // for select, radio, multiselect
  children?: Field[]; // nested child fields
};

type Form = {
  id: number;
  title: string;
  description: string;
  fields: Field[];
};

export default function SingleFormPage() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");

  const [form, setForm] = useState<Form | null>(null);

  // Values keyed by fieldId or fieldId_repeatIndex for repeated children
  const [values, setValues] = useState<Record<string, any>>({});
  const [fileValues, setFileValues] = useState<Record<string, File | File[]>>({});

  // Track how many repeat groups exist per parent field
  const [childRepeats, setChildRepeats] = useState<Record<number, number>>({});

  // Auto-fill date_now fields on load
  useEffect(() => {
    if (form?.fields.length) {
      const newValues: Record<string, any> = {};
      form.fields.forEach((field) => {
        if (field.type === "date_now") {
          newValues[`${field.id}`] = new Date().toISOString().split("T")[0];
        }
        // Also fill date_now for children groups if any
        (field.children ?? []).forEach((child) => {
          if (child.type === "date_now") {
            newValues[`${child.id}_0`] = new Date().toISOString().split("T")[0];
          }
        });
      });
      setValues((prev) => ({ ...newValues, ...prev }));
    }
  }, [form]);

  useEffect(() => {
    if (!formId) return;

    axios
      .get(`http://localhost:8000/api/forms/${formId}`)
      .then((res) => {
        const data = res.data.data || res.data.form || res.data;
        setForm(data);

        // Initialize repeat counts for fields with children
        const repeats: Record<number, number> = {};
        data.fields.forEach((f: Field) => {
          if (f.children?.length) repeats[f.id] = 1;
        });
        setChildRepeats(repeats);
      })
      .catch((err) => {
        console.error("Failed to load form:", err);
      });
  }, [formId]);

  // Handle text/select/checkbox input changes
  const handleChange = (fieldId: number, value: any, repeatIndex?: number) => {
    const key = repeatIndex !== undefined ? `${fieldId}_${repeatIndex}` : `${fieldId}`;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  // Handle file input changes
  const handleFileChange = (fieldId: number, files: FileList | null, repeatIndex?: number) => {
    if (!files) return;
    const key = repeatIndex !== undefined ? `${fieldId}_${repeatIndex}` : `${fieldId}`;
    setFileValues((prev) => ({
      ...prev,
      [key]: files.length === 1 ? files[0] : Array.from(files),
    }));
  };

  // Add another repeat group for a field with children
  const addRepeat = (parentId: number) => {
    setChildRepeats((prev) => ({
      ...prev,
      [parentId]: (prev[parentId] || 1) + 1,
    }));
  };

  // Render input based on field type
  const renderFieldInput = (
    field: Field,
    repeatIndex?: number
  ) => {
    const key = repeatIndex !== undefined ? `${field.id}_${repeatIndex}` : `${field.id}`;
    const value = values[key] || "";

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, repeatIndex)}
            className="p-2 border rounded w-full"
          />
        );

      case "textarea":
        return (
          <textarea
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, repeatIndex)}
            className="p-2 border rounded w-full"
          />
        );

      case "number":
        return (
          <input
            type="number"
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, repeatIndex)}
            className="p-2 border rounded w-full"
          />
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={!!value}
            required={field.required}
            onChange={(e) => handleChange(field.id, e.target.checked, repeatIndex)}
            className="p-2"
          />
        );

      case "radio":
        if (!field.options || field.options.length === 0) {
          return <p className="text-red-600">No options provided for radio</p>;
        }
        return (
          <div className="flex flex-col space-y-1">
            {field.options.map((opt, i) => (
              <label key={i} className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name={`radio_${key}`}
                  value={opt}
                  checked={value === opt}
                  required={field.required}
                  onChange={() => handleChange(field.id, opt, repeatIndex)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        );

      case "select":
        if (!field.options || field.options.length === 0) {
          return <p className="text-red-600">No options provided for select</p>;
        }
        return (
          <select
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, repeatIndex)}
            className="p-2 border rounded w-full"
          >
            <option value="">-- Select --</option>
            {field.options.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        if (!field.options || field.options.length === 0) {
          return <p className="text-red-600">No options provided for multi-select</p>;
        }
        return (
          <select
            multiple
            required={field.required}
            value={value}
            onChange={(e) =>
              handleChange(
                field.id,
                Array.from(e.target.selectedOptions, (opt) => opt.value),
                repeatIndex
              )
            }
            className="p-2 border rounded w-full"
          >
            {field.options.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "file":
        return (
          <input
            type="file"
            required={field.required}
            onChange={(e) => handleFileChange(field.id, e.target.files, repeatIndex)}
            className="p-2 border rounded w-full"
          />
        );

      case "date":
        return (
          <input
            type="date"
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, repeatIndex)}
            className="p-2 border rounded w-full"
          />
        );

      case "date_now":
        // auto-filled current date, read-only
        return (
          <input
            type="date"
            value={values[key] || new Date().toISOString().split("T")[0]}
            readOnly
            disabled
            className="p-2 border rounded w-full bg-gray-100 text-gray-600"
          />
        );

      default:
        return (
          <input
            type="text"
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, repeatIndex)}
            className="p-2 border rounded w-full"
          />
        );
    }
  };

  if (!form) return <p className="p-6">⏳ Loading form...</p>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
        <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
        <p className="text-gray-600 mb-6">{form.description}</p>

        {/* Render top-level fields */}
        {form.fields.map((field) => (
          <div key={field.id} className="mb-6 border-b pb-4">
            <label className="block text-lg font-medium mb-1">
              {field.label} {field.required && <span className="text-red-600">*</span>}
            </label>

            {/* Render input */}
            {renderFieldInput(field)}

            {/* Render children with repeat support */}
            {(field.children ?? []).length > 0 &&
              Array.from({ length: childRepeats[field.id] || 1 }).map((_, i) => (
                <div key={i} className="ml-4 mt-4 border-l pl-4">
                  <p className="text-sm text-gray-500 mb-2">Group {i + 1}</p>
                  {(field.children ?? []).map((child) => (
                    <div key={`${child.id}_${i}`} className="mb-2">
                      <label className="block text-sm">
                        {child.label} {child.required && <span className="text-red-600">*</span>}
                      </label>

                      {renderFieldInput(child, i)}
                    </div>
                  ))}
                </div>
              ))}

            {/* Button to add repeat groups for children */}
            {(field.children ?? []).length > 0 && (
              <button
                type="button"
                onClick={() => addRepeat(field.id)}
                className="text-blue-600 text-sm mt-2"
              >
                + Add Group
              </button>
            )}
          </div>
        ))}

        <button
          onClick={async () => {
            try {
              const formData = new FormData();

              // Append non-file values
              for (const key in values) {
                formData.append(`data[field_${key}]`, values[key]);
              }

              // Append file inputs
              for (const key in fileValues) {
                const val = fileValues[key];
                if (Array.isArray(val)) {
                  val.forEach((file, i) => {
                    formData.append(`data[field_${key}][${i}]`, file);
                  });
                } else {
                  formData.append(`data[field_${key}]`, val);
                }
              }

              formData.append("user_id", "1"); // Adjust user ID accordingly

              await axios.post(
                `http://localhost:8000/api/form/${form?.id}/submissions`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              alert("✅ Form submitted!");
            } catch (err) {
              console.error("Submission error:", err);
              alert("❌ Submission failed.");
            }
          }}
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit Form
        </button>
      </div>
    </DashboardLayout>
  );
}
