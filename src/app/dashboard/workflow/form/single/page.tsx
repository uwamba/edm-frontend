"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

type FieldType = "text" | "number" | "select" | "checkbox" | "radio" | "date" | "file";

interface ValidationRule {
  type: "min" | "max" | "regex" | "textLength";
  value: string | number;
  message: string;
}

interface Condition {
  field: string; // label of another field
  operator: "equals" | "not equals" | "greater than" | "less than";
  value: string | number;
  action: "show" | "hide";
}

interface Field {
  label: string;
  type: FieldType;
  options?: string[];
  required: boolean;
  validations?: ValidationRule[];
  conditions?: Condition[];
}

interface FormSchema {
  id: number;
  title: string;
  description: string;
  fields: Field[];
}

export default function SingleFormPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [form, setForm] = useState<FormSchema | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/api/forms/${id}`).then((res) => {
        setForm(res.data);
      });
    }
  }, [id]);

  const handleChange = (
    label: string,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { type, value, checked, files } = e.target as HTMLInputElement;
    setValues({
      ...values,
      [label]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files?.[0]
          : value,
    });
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
    form?.fields.forEach((field) => {
      if (evaluateConditions(field)) {
        const error = validateField(field, values[field.label]);
        if (error) newErrors[field.label] = error;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData();
      for (const key in values) {
        formData.append(key, values[key]);
      }
      try {
        await axios.post(
          `http://localhost:8000/api/forms/${id}/submit`,
          formData
        );
        alert("🎉 Form submitted successfully!");
      } catch (err) {
        console.error(err);
        alert("❌ Submission failed.");
      }
    }
  };

  if (!id) return <p>No form ID provided in URL.</p>;
  if (!form) return <p>Loading form...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
      <p className="mb-6">{form.description}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {form.fields.map(
          (field) =>
            evaluateConditions(field) && (
              <div key={field.label}>
                <label className="block font-medium mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === "text" && (
                  <input
                    type="text"
                    value={values[field.label] || ""}
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border rounded p-2"
                  />
                )}
                {field.type === "number" && (
                  <input
                    type="number"
                    value={values[field.label] || ""}
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border rounded p-2"
                  />
                )}
                {field.type === "select" && (
                  <select
                    value={values[field.label] || ""}
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
                {field.type === "radio" &&
                  field.options?.map((opt) => (
                    <div key={opt}>
                      <input
                        type="radio"
                        name={field.label}
                        value={opt}
                        checked={values[field.label] === opt}
                        onChange={(e) => handleChange(field.label, e)}
                      />
                      <span>{opt}</span>
                    </div>
                  ))}
                {field.type === "checkbox" && (
                  <input
                    type="checkbox"
                    checked={values[field.label] || false}
                    onChange={(e) => handleChange(field.label, e)}
                  />
                )}
                {field.type === "date" && (
                  <input
                    type="date"
                    value={values[field.label] || ""}
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border rounded p-2"
                  />
                )}
                {field.type === "file" && (
                  <input
                    type="file"
                    onChange={(e) => handleChange(field.label, e)}
                    className="w-full border rounded p-2"
                  />
                )}
                {errors[field.label] && (
                  <p className="text-red-600">{errors[field.label]}</p>
                )}
              </div>
            )
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
