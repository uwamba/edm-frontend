"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

type FieldType = "text" | "number" | "select" | "checkbox" | "radio" | "date" | "file";

interface ValidationRule {
  type: "min" | "max" | "regex" | "textLength" | "fileSize" | "fileType";
  value: string | number;
  message: string;
}

interface Condition {
  field: string;
  operator: "equals" | "not equals" | "greater than" | "less than";
  value: string | number;
  action: "show" | "hide";
}

interface FieldInput {
  id: number;
  label: string;
  type: FieldType;
  options?: string[];
  required: boolean;
  validations: ValidationRule[];
  conditions: Condition[];
  parentField?: string;
  parentMapping?: Record<string, string[]>;
  parent_field_id?: number;
}

interface FormData {
  title: string;
  description: string;
  fields: FieldInput[];
}

let fieldCounter = 1;

export default function CreateForm() {
  const [form, setForm] = useState<Omit<FormData, "fields">>({
    title: "",
    description: "",
  });
  const [fields, setFields] = useState<FieldInput[]>([]);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFieldChange = (
    id: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, [name]: type === "checkbox" ? checked : value } : f
      )
    );
  };

  const addField = (parentId?: number) => {
    const newField: FieldInput = {
      id: fieldCounter++,
      label: "",
      type: "text",
      options: [],
      required: false,
      validations: [],
      conditions: [],
      parentField: "",
      parentMapping: {},
      parent_field_id: parentId,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: number) => {
    setFields((prev) => prev.filter((f) => f.id !== id && f.parent_field_id !== id));
  };

  const addOption = (id: number) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, options: [...(f.options || []), ""] } : f
      )
    );
  };

  const removeOption = (fieldId: number, optIdx: number) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId && f.options) {
          const updatedOptions = [...f.options];
          updatedOptions.splice(optIdx, 1);
          return { ...f, options: updatedOptions };
        }
        return f;
      })
    );
  };

  const addParentMappingEntry = (fieldId: number, parent: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId ? {
          ...f,
          parentMapping: {
            ...f.parentMapping,
            [parent]: [],
          },
        } : f
      )
    );
  };

  const addChildToParent = (fieldId: number, parent: string, child: string) => {
    if (!child.trim()) return;
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId && f.parentMapping && f.parentMapping[parent]
          ? {
              ...f,
              parentMapping: {
                ...f.parentMapping,
                [parent]: [...f.parentMapping[parent], child.trim()],
              },
            }
          : f
      )
    );
  };

  const removeChildFromParent = (fieldId: number, parent: string, childIdx: number) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId && f.parentMapping && f.parentMapping[parent]) {
          const updatedChildren = [...f.parentMapping[parent]];
          updatedChildren.splice(childIdx, 1);
          return {
            ...f,
            parentMapping: {
              ...f.parentMapping,
              [parent]: updatedChildren,
            },
          };
        }
        return f;
      })
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: FormData = {
        ...form,
        fields,
      };
      console.log("Submitting payload:", payload);
      await axios.post("http://localhost:8000/api/forms", payload, {
        headers: { "Content-Type": "application/json" },
      });
      alert("🎉 Form created successfully!");
      setForm({ title: "", description: "" });
      setFields([]);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create form.");
    }
  };

  const renderFields = (parentId?: number) => {
    return fields
      .filter((f) => f.parent_field_id === parentId)
      .map((field) => (
        <div key={field.id} className="ml-4 border-l-2 pl-4 mt-4">
          <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">{field.label || `Field ${field.id}`}</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addField(field.id)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add Child
                </button>
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  ✖ Remove
                </button>
              </div>
            </div>
            <input
              type="text"
              name="label"
              value={field.label}
              onChange={(e) => handleFieldChange(field.id, e)}
              placeholder="Field label"
              className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="type"
              value={field.type}
              onChange={(e) => handleFieldChange(field.id, e)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
              <option value="date">Date</option>
              <option value="file">File</option>
            </select>
            {(field.type === "select" || field.type === "radio") && (
              <div>
                <h4 className="font-semibold text-gray-700">Options</h4>
                {field.options?.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        setFields((prev) =>
                          prev.map((f) =>
                            f.id === field.id ? {
                              ...f,
                              options: f.options?.map((o, i) => (i === idx ? e.target.value : o)),
                            } : f
                          )
                        );
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="p-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(field.id, idx)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(field.id)}
                  className="text-blue-600 hover:text-blue-800 mt-1 font-medium"
                >
                  + Add Option
                </button>
                <h4 className="font-semibold text-gray-700 mt-2">Parent → Child Mapping</h4>
                {Object.entries(field.parentMapping || {}).map(([parent, children], pIdx) => (
                  <div key={pIdx} className="mb-2 border border-gray-300 rounded p-2 bg-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-800">{parent}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...fields];
                          const fIdx = updated.findIndex((f) => f.id === field.id);
                          if (fIdx !== -1 && updated[fIdx].parentMapping) {
                            delete updated[fIdx].parentMapping![parent];
                          }
                          setFields(updated);
                        }}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        ✖
                      </button>
                    </div>
                    <ul className="list-disc ml-5 text-gray-700 mb-2">
                      {children.map((child, cIdx) => (
                        <li key={cIdx} className="flex justify-between items-center">
                          <span>{child}</span>
                          <button
                            type="button"
                            onClick={() => removeChildFromParent(field.id, parent, cIdx)}
                            className="text-red-600 hover:text-red-800 font-medium ml-2"
                          >
                            ✖
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New child option"
                        className="p-1 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            addChildToParent(field.id, parent, input.value);
                            input.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.querySelector<HTMLInputElement>(`#child-${field.id}-${pIdx}`);
                          if (input) {
                            addChildToParent(field.id, parent, input.value);
                            input.value = "";
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Add Child
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="New Parent Option"
                    className="p-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        addParentMappingEntry(field.id, input.value);
                        input.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector<HTMLInputElement>(`#parent-${field.id}`);
                      if (input) {
                        addParentMappingEntry(field.id, input.value);
                        input.value = "";
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Parent
                  </button>
                </div>
              </div>
            )}
          </div>
          {renderFields(field.id)}
        </div>
      ));
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">📋 Nested Form Builder</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleFormChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Form title"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Form description"
            />
          </div>
          {renderFields()}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => addField()}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              + Add Root Field
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex-1"
            >
              💾 Save Form
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
