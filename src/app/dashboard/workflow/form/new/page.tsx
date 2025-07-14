"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

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
  label: string;
  type: FieldType;
  options?: string[];
  required: boolean;
  validations: ValidationRule[];
  conditions: Condition[];
  parentField?: string;
  parentMapping?: Record<string, string[]>;
}

interface FormData {
  title: string;
  description: string;
  fields: FieldInput[];
}

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
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const updatedFields = [...fields];
    updatedFields[index] = {
      ...updatedFields[index],
      [name]: type === "checkbox" ? checked : value,
    };
    setFields(updatedFields);
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        label: "",
        type: "text",
        options: [],
        required: false,
        validations: [],
        conditions: [],
        parentField: "",
        parentMapping: {},
      },
    ]);
  };

  const removeField = (index: number) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  const addOption = (index: number) => {
    const updatedFields = [...fields];
    if (!updatedFields[index].options) updatedFields[index].options = [];
    updatedFields[index].options!.push("");
    setFields(updatedFields);
  };

  const removeOption = (fieldIdx: number, optIdx: number) => {
    const updatedFields = [...fields];
    updatedFields[fieldIdx].options!.splice(optIdx, 1);
    setFields(updatedFields);
  };

  // Add a new parent key to parentMapping object
  const addParentMappingEntry = (fieldIdx: number, parent: string) => {
    const updatedFields = [...fields];
    if (!updatedFields[fieldIdx].parentMapping) updatedFields[fieldIdx].parentMapping = {};
    if (!updatedFields[fieldIdx].parentMapping![parent]) {
      updatedFields[fieldIdx].parentMapping![parent] = [];
      setFields(updatedFields);
    }
  };

  // Add a child to a parent key inside parentMapping
  const addChildToParent = (fieldIdx: number, parent: string, child: string) => {
    if (!child.trim()) return;
    const updatedFields = [...fields];
    if (
      updatedFields[fieldIdx].parentMapping &&
      updatedFields[fieldIdx].parentMapping![parent]
    ) {
      updatedFields[fieldIdx].parentMapping![parent].push(child.trim());
      setFields(updatedFields);
    }
  };

  // Remove child from a parent key inside parentMapping
  const removeChildFromParent = (fieldIdx: number, parent: string, childIdx: number) => {
    const updatedFields = [...fields];
    if (
      updatedFields[fieldIdx].parentMapping &&
      updatedFields[fieldIdx].parentMapping![parent]
    ) {
      updatedFields[fieldIdx].parentMapping![parent].splice(childIdx, 1);
      setFields(updatedFields);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: FormData = { ...form, fields };
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

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">📋 Advanced Form Builder</h1>
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

        {fields.map((field, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-md bg-white shadow-sm"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {field.label || `Field ${index + 1}`}
              </h2>
              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                ✖ Remove
              </button>
            </div>
            <input
              type="text"
              name="label"
              value={field.label}
              onChange={(e) => handleFieldChange(index, e)}
              placeholder="Field label"
              className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="type"
              value={field.type}
              onChange={(e) => handleFieldChange(index, e)}
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
              <>
                <h3 className="font-semibold text-gray-700 mt-3">Options</h3>
                {field.options?.map((opt, optIdx) => (
                  <div key={optIdx} className="flex gap-2 mb-1">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[index].options![optIdx] = e.target.value;
                        setFields(updated);
                      }}
                      placeholder={`Option ${optIdx + 1}`}
                      className="p-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index, optIdx)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(index)}
                  className="text-blue-600 hover:text-blue-800 mt-1 font-medium"
                >
                  + Add Option
                </button>

                {/* Nested Select Support */}
                <h3 className="font-semibold text-gray-700 mt-4">Nested Select (Optional)</h3>
                <input
                  type="text"
                  placeholder="Parent Field Label"
                  value={field.parentField || ""}
                  onChange={(e) => {
                    const updated = [...fields];
                    updated[index].parentField = e.target.value;
                    setFields(updated);
                  }}
                  className="p-2 border border-gray-300 rounded-md w-full mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="mt-2">
                  <h4 className="font-medium text-gray-600 mb-1">Parent → Child Mapping</h4>
                  {Object.entries(field.parentMapping || {}).map(([parent, children], pIdx) => (
                    <div key={pIdx} className="mb-2 border border-gray-300 rounded p-2 bg-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{parent}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...fields];
                            delete updated[index].parentMapping![parent];
                            setFields(updated);
                          }}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove Parent
                        </button>
                      </div>
                      <ul className="list-disc ml-5 text-gray-700 mb-2">
                        {children.map((child, cIdx) => (
                          <li key={cIdx} className="flex justify-between items-center">
                            <span>{child}</span>
                            <button
                              type="button"
                              onClick={() => removeChildFromParent(index, parent, cIdx)}
                              className="text-red-600 hover:text-red-800 font-medium ml-2"
                            >
                              ✖
                            </button>
                          </li>
                        ))}
                      </ul>
                      <AddChildInput
                        fieldIdx={index}
                        parent={parent}
                        addChildToParent={addChildToParent}
                      />
                    </div>
                  ))}
                  <AddParentInput addParentMappingEntry={addParentMappingEntry} fieldIdx={index} />
                </div>
              </>
            )}
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addField}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            + Add Field
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
  );
}

// Separate component for adding a child to a parent
function AddChildInput({
  fieldIdx,
  parent,
  addChildToParent,
}: {
  fieldIdx: number;
  parent: string;
  addChildToParent: (fieldIdx: number, parent: string, child: string) => void;
}) {
  const [childValue, setChildValue] = useState("");

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="New child option"
        value={childValue}
        onChange={(e) => setChildValue(e.target.value)}
        className="p-1 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={() => {
          addChildToParent(fieldIdx, parent, childValue);
          setChildValue("");
        }}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        + Add Child
      </button>
    </div>
  );
}

// Separate component for adding a new parent key
function AddParentInput({
  addParentMappingEntry,
  fieldIdx,
}: {
  addParentMappingEntry: (fieldIdx: number, parent: string) => void;
  fieldIdx: number;
}) {
  const [parentValue, setParentValue] = useState("");

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="New Parent Option"
        value={parentValue}
        onChange={(e) => setParentValue(e.target.value)}
        className="p-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={() => {
          if (!parentValue.trim()) return;
          addParentMappingEntry(fieldIdx, parentValue.trim());
          setParentValue("");
        }}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        + Add Parent
      </button>
    </div>
  );
}
