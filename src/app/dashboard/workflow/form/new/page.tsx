'use client';
import { useEffect } from 'react';
import { useState, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'date_now'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'multiselect';

interface Field {
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  validations?: any[];
  conditions?: any[];
  parentMapping?: any[];
  parent_temp_id?: string | null;
  temp_id: string;
  default?: any;
  nestedOptions?: { [key: string]: string[] };
}

export default function CreateFormPage() {
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<Field[]>([]);

  const addField = (parentTempId: string | null = null) => {
    const newField: Field = {
      label: '',
      type: 'text',
      required: false,
      options: [],
      validations: [],
      conditions: [],
      parentMapping: [],
      parent_temp_id: parentTempId,
      temp_id: uuidv4(),
      nestedOptions: {},
    };
    setFields((prev) => [...prev, newField]);
  };




  const updateField = (index: number, key: keyof Field, value: any) => {
    setFields((prevFields) => {
      const updatedFields = [...prevFields];
      const updatedField = { ...updatedFields[index], [key]: value };

      // Reset options if type changes
      if (key === "type") {
        updatedField.options = [];
        updatedField.nestedOptions = {};
        updatedField.default = value === "date_now" ? new Date().toISOString().split("T")[0] : "";
      }

      updatedFields[index] = updatedField;

      // If the field being updated is a parent and default changed
      if (key === "default") {
        const parentTempId = updatedField.temp_id;
        const selectedValue = value;

        updatedFields.forEach((child, i) => {
          if (child.parent_temp_id === parentTempId) {
            const childOptions = child.nestedOptions?.[selectedValue] || [];
            updatedFields[i] = {
              ...child,
              options: childOptions,
            };
          }
        });
      }

      return updatedFields;
    });
  };
  useEffect(() => {
    setFields((prevFields) => {
      const updatedFields = [...prevFields];
      prevFields.forEach((field, index) => {
        if (field.parent_temp_id) {
          const parent = prevFields.find(f => f.temp_id === field.parent_temp_id);
          if (parent) {
            const parentValue = parent.default;
            const newOptions = field.nestedOptions?.[parentValue] || [];
            updatedFields[index] = {
              ...field,
              options: newOptions,
            };
          }
        }
      });
      return updatedFields;
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Set default value for date_now fields to current date string
    const updatedFields = fields.map((f) => {
      if (f.type === 'date_now') {
        return {
          ...f,
          default: new Date().toISOString().split('T')[0],
        };
      }
      return f;
    });

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        fields: updatedFields,
      };
      console.log('Submitting form data:', payload);
      const response = await axios.post('http://localhost:8000/api/forms', payload);
      alert('Form created successfully!');
      console.log(response.data);
    } catch (error: any) {
      console.error('Validation error:', error.response?.data?.errors || error.message);
      alert('Error: Check console for details');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Form</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Form Title"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <textarea
          placeholder="Form Description"
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <h2 className="text-lg font-semibold mt-6">Fields</h2>
        {fields.map((field, index) => {
          const parentField = field.parent_temp_id
            ? fields.find((f) => f.temp_id === field.parent_temp_id)
            : null;

          // For nested selects, determine options by parent's selected default value
          const parentValue = parentField?.default || '';
          const currentOptions = field.parent_temp_id
            ? field.nestedOptions?.[parentValue] || []
            : field.options || [];

          return (
            <div key={field.temp_id} className="border p-4 rounded space-y-2 bg-gray-50">
              <input
                type="text"
                placeholder="Field Label"
                value={field.label}
                onChange={(e) => updateField(index, 'label', e.target.value)}
                className="w-full border px-3 py-1 rounded"
                required
              />

              <select
                value={field.type}

                onChange={(e) => updateField(index, 'type', e.target.value)}
                className="w-full border px-3 py-1 rounded"
              >
                <option value="text">Text</option>
                <option value="textarea">Multi-line Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="date_now">Date (Now)</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio</option>
                <option value="file">File</option>
                <option value="multiselect">Multi Select</option>
              </select>

              {/* Options input for static (non-dependent) fields */}
              {(field.type === 'select' || field.type === 'radio' || field.type === 'multiselect') &&
                !field.parent_temp_id && (
                  <textarea
                    placeholder="Options (comma separated)"
                    value={field.options?.join(',') || ''}
                    onChange={(e) =>
                      updateField(index, 'options', e.target.value.split(',').map((o) => o.trim()))
                    }
                    className="w-full border px-3 py-1 rounded"
                  />
                )}

              {/* Nested options for dependent select fields */}
              {field.type === 'select' && field.parent_temp_id && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nested Options (value → comma-separated children)</label>
                 <textarea
                    placeholder="Options (comma separated)"
                    value={field.options?.join(',') || ''}
                    onChange={(e) =>
                      updateField(index, 'options', e.target.value.split(',').map((o) => o.trim()))
                    }
                    className="w-full border px-3 py-1 rounded"
                  />
                </div>
              )}


              {/* Default value selector for select and radio types */}
              {(field.type === 'select' || field.type === 'radio') && (
                <select
                  className="w-full border px-3 py-1 rounded"
                  value={field.default || ''}
                  onChange={(e) => updateField(index, 'default', e.target.value)}
                >
                  <option value="">-- Select Default --</option>
                  {currentOptions.map((option, i) => (
                    <option key={i} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* Checkbox default */}
              {field.type === 'checkbox' && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!field.default}
                    onChange={(e) => updateField(index, 'default', e.target.checked)}
                  />
                  <span>Default Checked</span>
                </label>
              )}

              {/* Textarea validations */}
              {(field.type === 'text' || field.type === 'textarea') && (
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min Characters"
                    className="w-1/2 border px-2 py-1 rounded"
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      updateField(index, 'validations', [
                        ...(field.validations || []).filter((v) => !('minLength' in v)),
                        { minLength: val },
                      ]);
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max Characters"
                    className="w-1/2 border px-2 py-1 rounded"
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      updateField(index, 'validations', [
                        ...(field.validations || []).filter((v) => !('maxLength' in v)),
                        { maxLength: val },
                      ]);
                    }}
                  />
                </div>
              )}

              {/* Number validations */}
              {field.type === 'number' && (
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min Value"
                    className="w-1/2 border px-2 py-1 rounded"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateField(index, 'validations', [
                        ...(field.validations || []).filter((v) => !('min' in v)),
                        { min: val },
                      ]);
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max Value"
                    className="w-1/2 border px-2 py-1 rounded"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateField(index, 'validations', [
                        ...(field.validations || []).filter((v) => !('max' in v)),
                        { max: val },
                      ]);
                    }}
                  />
                </div>
              )}

              {/* File validations */}
              {field.type === 'file' && (
                <input
                  type="number"
                  placeholder="Max File Size (MB)"
                  className="w-full border px-2 py-1 rounded"
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateField(index, 'validations', [
                      ...(field.validations || []).filter((v) => !('maxFileSize' in v)),
                      { maxFileSize: val },
                    ]);
                  }}
                />
              )}

              {/* Date_now info */}
              {field.type === 'date_now' && (
                <div className="text-sm text-gray-500">
                  This field will automatically use the current date on submission.
                </div>
              )}

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, 'required', e.target.checked)}
                />
                <span>Required</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => addField(field.temp_id)}
                >

                  Add Child
                </button>
                <button
                  type="button"
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => setFields((f) => f.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>

              {field.parent_temp_id && (
                <div className="text-sm text-gray-600">
                  ↳ Child of field: <code>{field.parent_temp_id}</code>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => addField()}
          >
            Add Top-Level Field
          </button>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">
            Save Form
          </button>
        </div>
      </form>
    </div>
  );
}
