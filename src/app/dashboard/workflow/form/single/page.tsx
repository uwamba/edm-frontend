"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

import {
  PencilLine,
  Hash,
  CalendarDays,
  File,
  FileText,
  ListTree,
  CheckSquare,
} from "lucide-react";

type Field = {
  id: number;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  children?: Field[];
};

type Form = {
  id: number;
  title: string;
  description: string;
  fields: Field[];
};

function getIconByType(type: string) {
  switch (type) {
    case "text":
      return <PencilLine className="inline-block mr-2 text-blue-600" size={18} />;
    case "number":
      return <Hash className="inline-block mr-2 text-blue-600" size={18} />;
    case "date":
    case "date_now":
      return <CalendarDays className="inline-block mr-2 text-blue-600" size={18} />;
    case "file":
      return <File className="inline-block mr-2 text-blue-600" size={18} />;
    case "textarea":
      return <FileText className="inline-block mr-2 text-blue-600" size={18} />;
    case "select":
    case "multiselect":
    case "radio":
      return <ListTree className="inline-block mr-2 text-blue-600" size={18} />;
    case "checkbox":
      return <CheckSquare className="inline-block mr-2 text-blue-600" size={18} />;
    default:
      return <PencilLine className="inline-block mr-2 text-blue-600" size={18} />;
  }
}

export default function SingleFormPage() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");

  const [form, setForm] = useState<Form | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [fileValues, setFileValues] = useState<Record<string, File | File[]>>({});
  const [childRepeats, setChildRepeats] = useState<Record<number, number>>({});

  useEffect(() => {
    if (form?.fields.length) {
      const newValues: Record<string, any> = {};
      form.fields.forEach((field) => {
        if (field.type === "date_now") {
          newValues[`${field.id}`] = new Date().toISOString().split("T")[0];
        }
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

  const handleChange = (fieldId: number, value: any, repeatIndex?: number) => {
    const key = repeatIndex !== undefined ? `${fieldId}_${repeatIndex}` : `${fieldId}`;
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (fieldId: number, files: FileList | null, repeatIndex?: number) => {
    if (!files) return;
    const key = repeatIndex !== undefined ? `${fieldId}_${repeatIndex}` : `${fieldId}`;
    setFileValues((prev) => ({
      ...prev,
      [key]: files.length === 1 ? files[0] : Array.from(files),
    }));
  };

  const addRepeat = (parentId: number) => {
    setChildRepeats((prev) => ({
      ...prev,
      [parentId]: (prev[parentId] || 1) + 1,
    }));
  };

  const baseInputStyle =
    "p-2 border rounded w-full text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  const renderFieldInput = (field: Field, repeatIndex?: number) => {
    const key = repeatIndex !== undefined ? `${field.id}_${repeatIndex}` : `${field.id}`;
    const value = values[key] || "";

    switch (field.type) {
      case "text":
      case "number":
      case "date":
        return (
          <input
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, repeatIndex)}
            className={baseInputStyle}
          />
        );

      case "textarea":
        return (
          <textarea
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, repeatIndex)}
            className={baseInputStyle}
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
        return (
          <div className="flex flex-col space-y-1">
            {field.options?.map((opt, i) => (
              <label key={i} className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`radio_${key}`}
                  value={opt}
                  checked={value === opt}
                  required={field.required}
                  onChange={() => handleChange(field.id, opt, repeatIndex)}
                  className="cursor-pointer"
                />
                <span>{opt}</span>
              </label>
            )) || <p className="text-red-600">No options provided for radio</p>}
          </div>
        );

      case "select":
        return (
          <select
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, repeatIndex)}
            className={baseInputStyle}
          >
            <option value="">-- Select --</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            )) || <option disabled>No options</option>}
          </select>
        );

      case "multiselect":
        return (
          <select
            multiple
            required={field.required}
            value={value}
            onChange={(e) =>
              handleChange(field.id, Array.from(e.target.selectedOptions, (opt) => opt.value), repeatIndex)
            }
            className={baseInputStyle}
          >
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            )) || <option disabled>No options</option>}
          </select>
        );

      case "file":
        return (
          <input
            type="file"
            required={field.required}
            onChange={(e) => handleFileChange(field.id, e.target.files, repeatIndex)}
            className={baseInputStyle}
          />
        );

      case "date_now":
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
            className={baseInputStyle}
          />
        );
    }
  };

  if (!form) return <p className="p-6">⏳ Loading form...</p>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl">
        <h1 className="text-3xl font-bold mb-2 text-blue-800">{form.title}</h1>
        <p className="text-gray-600 mb-6 italic">{form.description}</p>

        {form.fields.map((field) => (
          <div key={field.id} className="mb-10 border-b pb-6">
            <label
              className="block text-lg font-medium mb-2 text-gray-900 flex items-center"
              htmlFor={`field_${field.id}`}
            >
              {getIconByType(field.type)}
              {field.label}
              {field.required === true && <span className="text-red-600 ml-1">*</span>}
            </label>
            {renderFieldInput(field)}

            {(field.children ?? []).length > 0 &&
              Array.from({ length: childRepeats[field.id] || 1 }).map((_, i) => (
                <div
                  key={i}
                  className="ml-6 mt-4 border-l-4 pl-4 border-blue-400 bg-blue-50 rounded-md py-3"
                >
                  <p className="text-sm text-blue-700 font-semibold mb-2">Group {i + 1}</p>
                  {(field.children ?? []).map((child) => (
                    <div key={`${child.id}_${i}`} className="mb-4">
                      <label
                        className="block text-sm font-medium text-gray-800 mb-1 flex items-center"
                        htmlFor={`field_${child.id}_${i}`}
                      >
                        {getIconByType(child.type)}
                        {child.label}
                        {child.required === true && <span className="text-red-600 ml-1">*</span>}
                      </label>
                      {renderFieldInput(child, i)}
                    </div>
                  ))}
                </div>
              ))}

            {(field.children ?? []).length > 0 && (
              <button
                type="button"
                onClick={() => addRepeat(field.id)}
                className="text-blue-600 text-sm mt-3 hover:underline"
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
              for (const key in values) formData.append(`data[field_${key}]`, values[key]);
              for (const key in fileValues) {
                const val = fileValues[key];
                if (Array.isArray(val)) {
                  val.forEach((file, i) => formData.append(`data[field_${key}][${i}]`, file));
                } else {
                  formData.append(`data[field_${key}]`, val);
                }
              }
              formData.append("user_id", "1");
              await axios.post(`http://localhost:8000/api/form/${form?.id}/submissions`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              alert("✅ Form submitted!");
            } catch (err) {
              console.error("Submission error:", err);
              alert("❌ Submission failed.");
            }
          }}
          className="w-full py-3 mt-6 bg-green-600 text-white rounded-md hover:bg-green-700 text-lg font-semibold shadow"
        >
          Submit Form
        </button>
      </div>
    </DashboardLayout>
  );
}
