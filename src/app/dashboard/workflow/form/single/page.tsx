"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file";

interface ValidationRule {
  type: "min" | "max" | "regex" | "textLength";
  value: string | number;
  message: string;
}

interface Condition {
  field: string;
  operator: "equals" | "not equals" | "greater than" | "less than";
  value: string | number;
  action: "show" | "hide";
}

interface Field {
  id: number;
  label: string;
  type: FieldType;
  options?: string[];
  required: boolean;
  validations?: ValidationRule[];
  conditions?: Condition[];
  parentField?: string;
  parentMapping?: Record<string, string[]>;
}

interface FormSchema {
  id: number;
  title: string;
  description: string;
  fields: Field[];
}

export default function SingleFormPage() {
  const searchParams = useSearchParams();
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState<FormSchema | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paramId = searchParams.get("id");
    if (paramId) {
      setId(paramId);
      axios
        .get(`http://localhost:8000/api/forms/${paramId}`)
        .then((res) => {
          const formData = res.data?.data || res.data;
          if (formData?.fields) {
            setForm(formData);
          } else {
            console.error("Form data missing fields property", formData);
            setForm(null);
          }
        })
        .catch((err) => {
          console.error("Failed to load form:", err);
          setForm(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleChange = (
    label: string,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { type, value, checked, files } = e.target as HTMLInputElement;
    setValues((prev) => ({
      ...prev,
      [label]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0]
          : value,
    }));
  };

  const evaluateConditions = (field: Field): boolean => {
    if (!field.conditions) return true;
    return field.conditions.every((cond) => {
      const targetValue = values[cond.field];
      switch (cond.operator) {
        case "equals":
          return cond.action === "show"
            ? targetValue === cond.value
            : targetValue !== cond.value;
        case "not equals":
          return cond.action === "show"
            ? targetValue !== cond.value
            : targetValue === cond.value;
        case "greater than":
          return cond.action === "show"
            ? targetValue > cond.value
            : targetValue <= cond.value;
        case "less than":
          return cond.action === "show"
            ? targetValue < cond.value
            : targetValue >= cond.value;
        default:
          return true;
      }
    });
  };

  const validateField = (field: Field, value: any): string | null => {
    if (field.required && (value === undefined || value === "")) {
      return "This field is required.";
    }
    for (const rule of field.validations ?? []) {
      switch (rule.type) {
        case "min":
          if (value < rule.value) return rule.message;
          break;
        case "max":
          if (value > rule.value) return rule.message;
          break;
        case "regex":
          if (!new RegExp(rule.value as string).test(value))
            return rule.message;
          break;
        case "textLength":
          if (value.length < rule.value)
            return rule.message || `Minimum ${rule.value} characters.`;
          break;
      }
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    form?.fields?.forEach((field) => {
      if (evaluateConditions(field)) {
        const error = validateField(field, values[field.label]);
        if (error) newErrors[field.label] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData();

      form?.fields?.forEach((field) => {
        const key = `data[field_${field.id}]`;
        const value = values[field.label];

        if (field.type === "file" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value ?? "");
        }
      });

      try {
        await axios.post(
          `http://localhost:8000/api/form/${form?.id}/submissions`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("🎉 Form submitted successfully!");
      } catch (err) {
        console.error(err);
        alert("❌ Submission failed.");
      }
    }
  };

  if (loading) return <p className="text-gray-800">Loading...</p>;
  if (!form) return <p className="text-red-600">Form not found or failed to load.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white text-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">{form.title}</h1>
      <p className="mb-6 text-gray-600">{form.description}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.fields.map(
          (field) =>
            evaluateConditions(field) && (
              <div key={field.label}>
                <label className="block font-medium mb-1 text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-600">*</span>}
                </label>

                {field.parentField && field.parentMapping ? (
                  <>
                    <select
                      value={values[field.parentField] || ""}
                      onChange={(e) => handleChange(field.parentField!, e)}
                      className="w-full border border-gray-300 rounded p-2 bg-white text-gray-800"
                    >
                      <option value="">Select {field.parentField}...</option>
                      {Object.keys(field.parentMapping).map((parent) => (
                        <option key={parent} value={parent}>
                          {parent}
                        </option>
                      ))}
                    </select>

                    <select
                      value={values[field.label] || ""}
                      onChange={(e) => handleChange(field.label, e)}
                      className="w-full border border-gray-300 rounded p-2 bg-white text-gray-800"
                    >
                      <option value="">Select {field.label}...</option>
                      {(field.parentMapping[values[field.parentField]] || []).map(
                        (child) => (
                          <option key={child} value={child}>
                            {child}
                          </option>
                        )
                      )}
                    </select>
                  </>
                ) : field.type === "select" ? (
                  <select
                    value={values[field.label] || ""}
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border border-gray-300 rounded p-2 bg-white text-gray-800"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "text" ? (
                  <input
                    type="text"
                    value={values[field.label] || ""}
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border border-gray-300 rounded p-2 bg-white text-gray-800"
                  />
                ) : field.type === "number" ? (
                  <input
                    type="number"
                    value={values[field.label] || ""}
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border border-gray-300 rounded p-2 bg-white text-gray-800"
                  />
                ) : field.type === "date" ? (
                  <input
                    type="date"
                    value={values[field.label] || ""}
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border border-gray-300 rounded p-2 bg-white text-gray-800"
                  />
                ) : field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={values[field.label] || false}
                    onChange={(e) => handleChange(field.label, e)}
                    className="mr-2"
                  />
                ) : field.type === "file" ? (
                  <input
                    type="file"
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border border-gray-300 rounded p-2 bg-white text-gray-800"
                  />
                ) : null}

                {errors[field.label] && (
                  <p className="text-red-600">{errors[field.label]}</p>
                )}
              </div>
            )
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
