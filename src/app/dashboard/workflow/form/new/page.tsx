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
  field: string; // label of another field
  operator: "equals" | "not equals" | "greater than" | "less than";
  value: string | number;
  action: "show" | "hide";
}

interface FieldInput {
  label: string;
  type: FieldType;
  options?: string;
  required: boolean;
  validations: ValidationRule[];
  conditions: Condition[];
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
        options: "",
        required: false,
        validations: [],
        conditions: [],
      },
    ]);
  };

  const removeField = (index: number) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  const addValidationRule = (index: number) => {
    const updatedFields = [...fields];
    updatedFields[index].validations.push({
      type: "min",
      value: "",
      message: "",
    });
    setFields(updatedFields);
  };

  const addCondition = (index: number) => {
    const updatedFields = [...fields];
    updatedFields[index].conditions.push({
      field: "",
      operator: "equals",
      value: "",
      action: "show",
    });
    setFields(updatedFields);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: FormData = { ...form, fields };
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
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">🔧 Advanced Form Builder</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleFormChange}
            className="w-full p-2 border rounded"
            placeholder="Form title"
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            className="w-full p-2 border rounded"
            placeholder="Form description"
          />
        </div>

        {fields.map((field, index) => (
          <div key={index} className="p-4 border rounded bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{field.label || `Field ${index + 1}`}</h2>
              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-red-500"
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
              className="w-full p-2 border rounded mb-2"
            />
            <select
              name="type"
              value={field.type}
              onChange={(e) => handleFieldChange(index, e)}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
              <option value="date">Date</option>
              <option value="file">File</option>
            </select>

            {/* Options */}
            {(field.type === "select" || field.type === "radio") && (
              <input
                type="text"
                name="options"
                value={field.options}
                onChange={(e) => handleFieldChange(index, e)}
                placeholder="Comma separated options"
                className="w-full p-2 border rounded mb-2"
              />
            )}

            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={() => {
                  const updatedFields = [...fields];
                  updatedFields[index].required = !updatedFields[index].required;
                  setFields(updatedFields);
                }}
              />
              <span>Required</span>
            </div>

            {/* Validation Rules */}
            <div className="mt-2">
              <h3 className="font-semibold">Validations</h3>
              {field.validations.map((rule, ruleIdx) => (
                <div key={ruleIdx} className="flex gap-2 mb-2">
                  <select
                    value={rule.type}
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[index].validations[ruleIdx].type = e.target.value as ValidationRule["type"];
                      setFields(updated);
                    }}
                    className="p-1 border rounded"
                  >
                    <option value="min">Min</option>
                    <option value="max">Max</option>
                    <option value="regex">Regex</option>
                    <option value="textLength">Text Length</option>
                    <option value="fileSize">File Size</option>
                    <option value="fileType">File Type</option>
                  </select>
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[index].validations[ruleIdx].value = e.target.value;
                      setFields(updated);
                    }}
                    placeholder="Value"
                    className="p-1 border rounded flex-1"
                  />
                  <input
                    type="text"
                    value={rule.message}
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[index].validations[ruleIdx].message = e.target.value;
                      setFields(updated);
                    }}
                    placeholder="Error Message"
                    className="p-1 border rounded flex-1"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => addValidationRule(index)}
                className="text-blue-500"
              >
                + Add Validation Rule
              </button>
            </div>

            {/* Conditional Logic */}
            <div className="mt-2">
              <h3 className="font-semibold">Conditional Logic</h3>
              {field.conditions.map((cond, condIdx) => (
                <div key={condIdx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Field Label"
                    value={cond.field}
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[index].conditions[condIdx].field = e.target.value;
                      setFields(updated);
                    }}
                    className="p-1 border rounded flex-1"
                  />
                  <select
                    value={cond.operator}
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[index].conditions[condIdx].operator = e.target.value as Condition["operator"];
                      setFields(updated);
                    }}
                    className="p-1 border rounded"
                  >
                    <option value="equals">Equals</option>
                    <option value="not equals">Not Equals</option>
                    <option value="greater than">Greater Than</option>
                    <option value="less than">Less Than</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Value"
                    value={cond.value}
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[index].conditions[condIdx].value = e.target.value;
                      setFields(updated);
                    }}
                    className="p-1 border rounded flex-1"
                  />
                  <select
                    value={cond.action}
                    onChange={(e) => {
                      const updated = [...fields];
                      updated[index].conditions[condIdx].action = e.target.value as Condition["action"];
                      setFields(updated);
                    }}
                    className="p-1 border rounded"
                  >
                    <option value="show">Show</option>
                    <option value="hide">Hide</option>
                  </select>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addCondition(index)}
                className="text-blue-500"
              >
                + Add Condition
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addField}
          className="py-2 px-4 bg-blue-600 text-white rounded-lg"
        >
          + Add Field
        </button>

        <button
          type="submit"
          className="w-full py-3 bg-green-600 text-white rounded-lg mt-4"
        >
          💾 Save Form
        </button>
      </form>
    </div>
  );
}
