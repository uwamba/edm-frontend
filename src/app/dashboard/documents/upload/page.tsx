'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

export default function DocumentUploadForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleTagChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    setTags(selected);
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
    formData.append('tags', JSON.stringify(tags));
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

    // You can call a backend API here if needed
    console.log('Creating folder:', newFolderName);

    // Close modal
    setShowCreateFolderModal(false);
    setNewFolderName('');
  };

  return (
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
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">File</label>
          <input
            type="file"
            onChange={e => setFile(e.target.files?.[0] || null)}
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

      {/* Modal for Create Folder */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create New Folder</h2>
            <input
              type="text"
              placeholder="Enter folder name (e.g. 2025)"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
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
    </div>
  );
}
