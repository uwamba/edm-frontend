/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/app/components/DashboardLayout";

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
  parent_field_id?: number | null;
  repeatable?: boolean;
  children?: Field[];
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
            console.log("Form data loaded:", formData);
            setForm(formData);
            initializeValues(formData.fields);
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

  // Initialize default empty values for repeatable groups and fields
  const initializeValues = (fields: Field[], basePath: (string | number)[] = []) => {
    fields.forEach((field) => {
      const path = [...basePath, field.label];
      if (field.repeatable) {
        setValues((prev) => setNestedValue(prev, path, []));
        if (field.children && field.children.length > 0) {
          // No default instances yet for repeatable groups
          // Optionally you could add an empty object to start with one instance:
          // setValues(prev => setNestedValue(prev, path, [{}]));
        }
      } else if (field.children && field.children.length > 0) {
        initializeValues(field.children, path);
      } else {
        setValues((prev) => {
          const currVal = getNestedValue(prev, path);
          if (currVal === undefined) {
            // Default empty string or false for checkbox
            const defaultVal = field.type === "checkbox" ? false : "";
            return setNestedValue(prev, path, defaultVal);
          }
          return prev;
        });
      }
    });
  };

  // Helpers to get/set nested values by path array
  const getNestedValue = (obj: any, path: (string | number)[]) => {
    return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  const setNestedValue = (
    obj: any,
    path: (string | number)[],
    value: any
  ): any => {
    if (path.length === 0) return value;
    const [head, ...rest] = path;
    return {
      ...obj,
      [head]: setNestedValue(
        obj?.[head] ?? (typeof rest[0] === "number" ? [] : {}),
        rest,
        value
      ),
    };
  };

  // Evaluate conditions to show/hide fields
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

  // Validate one field value
  const validateField = (field: Field, value: any): string | null => {
    if (field.required && (value === undefined || value === "" || value === null || (Array.isArray(value) && value.length === 0))) {
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
          if (typeof value === "string" && value.length < (rule.value as number))
            return rule.message || `Minimum ${rule.value} characters.`;
          break;
      }
    }
    return null;
  };

  // Handle input change by path
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    path: (string | number)[]
  ) => {
    const { type, checked, files, value } = e.target as HTMLInputElement;
    let newVal: any =
      type === "checkbox" ? checked : type === "file" ? files?.[0] : value;

    setValues((prev) => setNestedValue(prev, path, newVal));
  };

  // Add new instance for repeatable group
  const addGroupInstance = (field: Field, path: (string | number)[]) => {
    setValues((prev) => {
      const arr = getNestedValue(prev, path) ?? [];
      if (!Array.isArray(arr)) return prev;
      return setNestedValue(prev, path, [...arr, {}]);
    });
  };

  // Remove instance for repeatable group
  const removeGroupInstance = (path: (string | number)[], idx: number) => {
    setValues((prev) => {
      const arr = getNestedValue(prev, path);
      if (!Array.isArray(arr)) return prev;
      const updatedArr = [...arr];
      updatedArr.splice(idx, 1);
      return setNestedValue(prev, path, updatedArr);
    });
  };

  // Recursive field renderer
  const FieldRenderer = ({
    field,
    path,
  }: {
    field: Field;
    path: (string | number)[];
  }) => {
    if (!evaluateConditions(field)) return null;

    // Leaf input field (no children)
    if (!field.children || field.children.length === 0) {
      const val = getNestedValue(values, path) ?? (field.type === "checkbox" ? false : "");

      return (
        <div className="mb-4">
          <label className="block font-medium mb-1 text-gray-700">
            {field.label}
            {field.required && <span className="text-red-600">*</span>}
          </label>

          {field.type === "select" ? (
            <select
              value={val}
              onChange={(e) => handleInputChange(e, path)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === "checkbox" ? (
            <input
              type="checkbox"
              checked={val}
              onChange={(e) => handleInputChange(e, path)}
              className="mr-2"
            />
          ) : (
            <input
              type={field.type}
              value={val}
              onChange={(e) => handleInputChange(e, path)}
              className="w-full border border-gray-300 rounded p-2"
            />
          )}

          {errors[path.join(".")] && (
            <p className="text-red-600">{errors[path.join(".")]}</p>
          )}
        </div>
      );
    }

    // Group with children

    // Repeatable group rendering
    if (field.repeatable) {
      const instances = getNestedValue(values, path) ?? [];

      return (
        <div className="mb-6 border p-4 rounded bg-gray-50">
          <h3 className="font-semibold mb-2 text-lg">{field.label}</h3>

          {Array.isArray(instances) && instances.length === 0 && (
            <p className="mb-2 text-gray-500">No entries added yet.</p>
          )}

          {Array.isArray(instances) &&
            instances.map((_: any, idx: number) => (
              <div
                key={idx}
                className="mb-4 p-4 border border-gray-300 rounded bg-white relative"
              >
                {/* Render child fields inside this group instance */}
                {field.children?.map((child) => (
                  <FieldRenderer
                    key={child.id}
                    field={child}
                    path={[...path, idx, child.label]}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => removeGroupInstance(path, idx)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded"
                  aria-label="Remove group"
                >
                  Remove
                </button>
              </div>
            ))}

          <button
            type="button"
            onClick={() => addGroupInstance(field, path)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add {field.label}
          </button>
        </div>
      );
    }

    // Non-repeatable group with children - render children inline
    return (
      <div className="mb-6 border p-4 rounded bg-gray-50">
        <h3 className="font-semibold mb-2 text-lg">{field.label}</h3>
        {field.children?.map((child) => (
          <FieldRenderer key={child.id} field={child} path={[...path, child.label]} />
        ))}
      </div>
    );
  };

  // Validate entire form recursively
  const validateFields = (
    fields: Field[],
    currentPath: (string | number)[]
  ) => {
    fields.forEach((field) => {
      if (!evaluateConditions(field)) return;

      if (field.repeatable) {
        const arr = getNestedValue(values, [...currentPath, field.label]);
        if (!Array.isArray(arr) || arr.length === 0) {
          if (field.required) {
            setErrors((prev) => ({
              ...prev,
              [[...currentPath, field.label].join(".")]: "At least one entry is required.",
            }));
          }
          return;
        }
        arr.forEach((_: any, idx: number) => {
          if (field.children) {
            validateFields(field.children, [...currentPath, field.label, idx]);
          }
        });
      } else if (field.children && field.children.length > 0) {
        validateFields(field.children, [...currentPath, field.label]);
      } else {
        const val = getNestedValue(values, [...currentPath, field.label]);
        const err = validateField(field, val);
        if (err) {
          setErrors((prev) => ({
            ...prev,
            [[...currentPath, field.label].join(".")]: err,
          }));
        }
      }
    });
  };

  // Flatten values for FormData submission
  const flattenValues = (
    vals: any,
    parentKey = "data",
    result: Record<string, any> = {}
  ) => {
    if (vals === null || vals === undefined) return result;

    if (typeof vals !== "object" || vals instanceof File) {
      result[parentKey] = vals;
      return result;
    }

    if (Array.isArray(vals)) {
      vals.forEach((item, idx) => {
        flattenValues(item, `${parentKey}[${idx}]`, result);
      });
    } else {
      Object.entries(vals).forEach(([key, val]) => {
        flattenValues(val, `${parentKey}[${key}]`, result);
      });
    }

    return result;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setErrors({}); // clear errors first
    const newErrors: Record<string, string> = {};

    // Validate recursively
    const validateRec = (
      fields: Field[],
      currentPath: (string | number)[]
    ) => {
      fields.forEach((field) => {
        if (!evaluateConditions(field)) return;

        if (field.repeatable) {
          const arr = getNestedValue(values, [...currentPath, field.label]);
          if (!Array.isArray(arr) || arr.length === 0) {
            newErrors[[...currentPath, field.label].join(".")] =
              "At least one entry is required.";
            return;
          }
          arr.forEach((_: any, idx: number) => {
            if (field.children) {
              validateRec(field.children, [...currentPath, field.label, idx]);
            }
          });
        } else if (field.children && field.children.length > 0) {
          validateRec(field.children, [...currentPath, field.label]);
        } else {
          const val = getNestedValue(values, [...currentPath, field.label]);
          const err = validateField(field, val);
          if (err) {
            newErrors[[...currentPath, field.label].join(".")] = err;
          }
        }
      });
    };

    validateRec(form?.fields ?? [], []);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      alert("Please fix validation errors before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      const flat = flattenValues(values);
      Object.entries(flat).forEach(([key, val]) => {
        if (val instanceof File) {
          formData.append(key, val);
        } else {
          formData.append(key, val ?? "");
        }
      });

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
      setValues({});
      setErrors({});
    } catch (err) {
      console.error(err);
      alert("❌ Submission failed.");
    }
  };

  if (loading)
    return <p className="text-gray-800 text-center mt-10">Loading...</p>;
  if (!form)
    return (
      <p className="text-red-600 text-center mt-10">
        Form not found or failed to load.
      </p>
    );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white text-gray-800 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">{form.title}</h1>
        <p className="mb-6 text-gray-600">{form.description}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields.map((field) => (
            <FieldRenderer key={field.id} field={field} path={[field.label]} />
          ))}

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
