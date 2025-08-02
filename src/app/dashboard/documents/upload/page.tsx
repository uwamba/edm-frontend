'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import DashboardLayout from "@/app/components/DashboardLayout";
type TagData = {
  id: number;    // tag id from DB
  name: string;  // display name
  value: string; // user-provided value
};

export default function DocumentUploadForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');



  const [tagName, setTagName] = useState('');
  const [tagValue, setTagValue] = useState('');

  const [modelTypes, setModelTypes] = useState<any[]>([]);
  const [selectedModelType, setSelectedModelType] = useState('');
  const [showModelTypeModal, setShowModelTypeModal] = useState(false);
  const [newModelTypeName, setNewModelTypeName] = useState('');

  const [tags, setTags] = useState<{ id: number; name: string; value: string }[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>(''); // or just useState('') if inferred


  const [selectedTagName, setSelectedTagName] = useState("");

  // new states for modal
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagValue, setNewTagValue] = useState("");
const [securityLevel, setSecurityLevel] = useState('');


  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/tags");
      const data = await res.json();
      setExistingTags(data);
    } catch (error) {
      console.error("Failed to fetch tags", error);
    }
  };

  // Add existing tag + value pair


  // Add new tag to backend
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return alert("Tag name cannot be empty");
    try {
      const res = await fetch("http://localhost:8000/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName, value: newTagValue }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add tag");
      }
      const createdTag = await res.json();
      setExistingTags((prev) => [...prev, createdTag]);
      setShowAddTagModal(false);
      setNewTagName("");
      setNewTagValue("");
    } catch (err) {

    }
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/model-types')
      .then((res) => res.json())
      .then((data) => setModelTypes(data))
      .catch((err) => console.error('Error fetching model types:', err));
  }, []);



 const handleTagAdd = () => {
  if (selectedTagId && tagValue.trim()) {
    const tagId = Number(selectedTagId); // ✅ convert to number
    const tag = existingTags.find(t => t.id === tagId);
    if (tag) {
      setTags((prev) => [
        ...prev,
        { id: tag.id, name: tag.name, value: tagValue }
      ]);
      setTagValue('');
      setSelectedTagId(''); // ✅ reset to empty string, not 0
    }
  } else {
    alert("Please select a tag and enter a value.");
  }
};




  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('tags', JSON.stringify(
      tags.map(tag => ({
        tag_id: tag.id,
        value: tag.value
      }))
    ));
    formData.append('model_type_id', selectedModelType);
    formData.append('user_id', '1'); // Replace with real user

    setUploading(true);

    try {
      const res = await fetch(`http://localhost:8000/api/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }

      setSuccess(true);
      setName('');
      setDescription('');
      setFile(null);
      setTags([]);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };



  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      alert('Folder name cannot be empty.');
      return;
    }
    console.log('Creating folder:', newFolderName);
    setShowCreateFolderModal(false);
    setNewFolderName('');
  };
  const [existingTags, setExistingTags] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/tags')
      .then(res => res.json())
      .then(data => setExistingTags(data))
      .catch(err => console.error(err));
  }, []);


  const handleCreateModelType = async () => {
    if (!newModelTypeName.trim()) return;

    try {
      const res = await fetch('http://localhost:8000/api/model-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newModelTypeName }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create model type');
      }

      const newModel = await res.json();
      setModelTypes([...modelTypes, newModel]);
      setSelectedModelType(newModel.id);
      setNewModelTypeName('');
      setShowModelTypeModal(false);
    } catch (err: any) {
      alert(err.message || 'Error adding model type');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow text-black">
        <h1 className="text-xl font-bold mb-4">Upload Document</h1>

        {error && <p className="text-red-600 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">Upload successful!</p>}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Document Name</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
  <label className="block mb-1 font-medium">Model Type</label>
  <div className="flex space-x-2">
    <select
      className="w-full border px-3 py-2 rounded"
      value={selectedModelType}
      onChange={(e) => setSelectedModelType(e.target.value)}
    >
      <option value="">-- Select Model Type --</option>
      {modelTypes.map((type) => (
        <option key={type.id} value={type.id}>
          {type.name}
        </option>
      ))}
    </select>
    <button
      type="button"
      className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      onClick={() => setShowModelTypeModal(true)}
    >
      Add
    </button>
  </div>
</div>

<div className="mt-4">
  <label className="block mb-1 font-medium">Security Level</label>
  <select
    className="w-full border px-3 py-2 rounded"
    value={securityLevel}
    onChange={(e) => setSecurityLevel(e.target.value)}
  >
    <option value="">-- Select Security Level --</option>
    <option value="Confidential">Confidential</option>
    <option value="Secret">Secret</option>
    <option value="Internal">Internal</option>
    <option value="External">External</option>
    <option value="Public">Public</option>
  </select>
</div>


          {/* Tags select/input/add block */}
          <div>
            <label className="block mb-1 font-medium">Tags</label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedTagId}
                onChange={(e) => setSelectedTagId(e.target.value)}
              >
                <option value="">-- Select Tag --</option>
                {existingTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>


              <input
                type="text"
                placeholder="Tag value"
                className="border px-2 py-1 rounded w-1/2"
                value={tagValue}
                onChange={(e) => setTagValue(e.target.value)}
              />

              <button
                type="button"
                className="bg-gray-700 text-white px-3 rounded hover:bg-gray-800"
                onClick={handleTagAdd}
              >
                +
              </button>

              {/* Button to open Add Tag modal */}
              <button
                type="button"
                className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
                onClick={() => setShowAddTagModal(true)}
              >
                Add New Tag
              </button>
            </div>

            {/* Display added tags */}
            <div className="space-y-1">
              {tags.map((tag, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  {tag.name}: {tag.value}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Tag Modal */}
          {showAddTagModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Add New Tag</h2>

                <input
                  type="text"
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-4"
                />

                <input
                  type="text"
                  placeholder="Tag default value (optional)"
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-4"
                />

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddTagModal(false)}
                    className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTag}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          )}



          <div>
            <label className="block mb-1 font-medium">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
              accept="*/*"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>

          <button
            type="button"
            onClick={() => setShowCreateFolderModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Folder
          </button>
        </form>

        {/* Create Folder Modal */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Create New Folder</h2>
              <input
                type="text"
                placeholder="Enter folder name (e.g. 2025)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Model Type Modal */}
        {showModelTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">Add New Model Type</h2>
              <input
                type="text"
                placeholder="e.g. Policy, Contract"
                value={newModelTypeName}
                onChange={(e) => setNewModelTypeName(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModelTypeModal(false)}
                  className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateModelType}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
