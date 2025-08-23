/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileType2,
  FileTextIcon,
  FileArchive,
  File,
  Eye,
  Pencil,
  Share2,
  Trash2,
  X
} from 'lucide-react';

interface Document {
  id: number;
  name: string;
  description: string;
  path: string;
  mime_type: string;
  size: number;
  created_at: string;
}

interface Props {
  year: string;
}

const getFileIcon = (mime: string) => {
  if (mime.includes('pdf')) return <FileType2 className="text-red-600" />;
  if (mime.includes('word') || mime.includes('msword')) return <FileTextIcon className="text-blue-600" />;
  if (mime.includes('excel') || mime.includes('spreadsheet')) return <FileSpreadsheet className="text-green-600" />;
  if (mime.includes('image')) return <FileImage className="text-purple-600" />;
  if (mime.includes('zip') || mime.includes('rar')) return <FileArchive className="text-yellow-600" />;
  if (mime.includes('text')) return <File className="text-gray-600" />;
  return <File className="text-gray-400" />;
};

export default function DocumentsByYear({ year }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filtered, setFiltered] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:8000/api/documents?folder=documents/${year}`);
        if (!res.ok) throw new Error(`Failed to load documents: ${res.statusText}`);
        const data = await res.json();
        const docs = data.data || data;
        setDocuments(docs);
        setFiltered(docs);
      } catch (err: any) {
        setError(err.message || 'Error loading documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [year]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(documents);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        documents.filter(
          (doc) =>
            doc.name.toLowerCase().includes(q) ||
            (doc.description || '').toLowerCase().includes(q)
        )
      );
    }
  }, [search, documents]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete document');
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setFiltered((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      alert('Error deleting document');
      console.error(err);
    }
  };

  const openEditModal = (doc: Document) => {
    setEditDoc(doc);
    setEditName(doc.name);
    setEditDescription(doc.description || '');
    setIsEditOpen(true);
  };

  // ✅ Updated handleUpdateDocument
  const handleUpdateDocument = async () => {
    if (!editDoc) return;

    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('description', editDescription);
      if (newFile) formData.append('file', newFile);

      // Laravel requires _method for PUT with FormData
      formData.append('_method', 'PUT');

      const res = await fetch(`http://localhost:8000/api/documents/${editDoc.id}`, {
        method: 'POST', // use POST but Laravel treats it as PUT
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update document');
      }

      const updated = await res.json();

      setDocuments((prev) =>
        prev.map((d) => (d.id === editDoc.id ? updated : d))
      );
      setFiltered((prev) =>
        prev.map((d) => (d.id === editDoc.id ? updated : d))
      );

      setIsEditOpen(false);
      setNewFile(null);
    } catch (err: any) {
      alert('Error updating document: ' + err.message);
      console.error(err);
    }
  };

  // UPDATED handleShare to also open Google Drive
  const handleShare = (doc: Document) => {
    const shareUrl = `http://localhost:8000/storage/${doc.path}`;

    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('Document link copied to clipboard!');
        window.open(`https://drive.google.com/drive/u/0/my-drive`, '_blank');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link');
      });
  };

  return (
    <DashboardLayout>
      <div className="relative overflow-x-auto overflow-y-auto max-h-[500px] border rounded shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            onChange={(e) => {
              const type = e.target.value;
              if (type === '') {
                setFiltered(documents);
              } else {
                setFiltered(documents.filter((doc) => doc.mime_type.includes(type)));
              }
            }}
            className="w-full sm:w-52 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="excel">Excel</option>
            <option value="image">Image</option>
            <option value="zip">Zip</option>
            <option value="text">Text</option>
          </select>
        </div>

        <table className="w-full table-auto border border-gray-300 text-sm shadow rounded-md">
          <thead className="bg-gray-100">
            <tr className="text-gray-700 uppercase tracking-wide font-semibold">
              <th className="px-4 py-3 border border-gray-300 text-left"><FileText size={14} />Type</th>
              <th className="px-4 py-3 border border-gray-300 text-left"><File size={14} />Name</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Description</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Mime Type</th>
              <th className="px-4 py-3 border border-gray-300 text-right">Size (KB)</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Uploaded</th>
              <th className="px-4 py-3 border border-gray-300 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc, idx) => (
              <tr key={doc.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                <td className="px-4 py-3 border border-gray-300 text-center text-gray-900">
                  {getFileIcon(doc.mime_type)}
                </td>
                <td
                  className="px-4 py-3 border border-gray-300 font-semibold truncate max-w-[200px] text-gray-900"
                  title={doc.name}
                >
                  {doc.name}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-gray-900">
                  {doc.description || '—'}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-gray-900">
                  {doc.mime_type}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right text-gray-900">
                  {(doc.size / 1024).toFixed(1)} KB
                </td>
                <td className="px-4 py-3 border border-gray-300 text-gray-900">
                  {new Date(doc.created_at).toLocaleString()}
                </td>

                <td className="px-4 py-3 border border-gray-300">
                  <div className="flex gap-2 justify-center">
                    <a href={`http://localhost:8000/storage/${doc.path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><Eye size={16} />View</a>
                    <button onClick={() => openEditModal(doc)} className="text-yellow-600 hover:underline flex items-center gap-1"><Pencil size={16} />Edit</button>
                    <button onClick={() => handleShare(doc)} className="text-green-600 hover:underline flex items-center gap-1"><Share2 size={16} />Share</button>
                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:underline flex items-center gap-1"><Trash2 size={16} />Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditOpen && editDoc && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-4xl relative animate-fadeInScale">
      {/* Close button */}
      <button
        onClick={() => setIsEditOpen(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
      >
        <X size={22} />
      </button>

      {/* Title */}
      <h2 className="text-xl font-bold mb-5 text-gray-900 border-b pb-2">
        Edit Document
      </h2>

      {/* Landscape layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Editable Fields */}
        <div>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter document name"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter description"
            />
          </div>
        </div>

        {/* Right: Document Info */}
        <div>
          {/* Mime Type */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mime Type</label>
            <input
              type="text"
              value={editDoc.mime_type}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-gray-100"
            />
          </div>

          {/* Size */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Size (KB)</label>
            <input
              type="text"
              value={(editDoc.size / 1024).toFixed(1)}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-gray-100"
            />
          </div>

          {/* Uploaded */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded</label>
            <input
              type="text"
              value={new Date(editDoc.created_at).toLocaleString()}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-gray-100"
            />
          </div>

          {/* Path */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
            <input
              type="text"
              value={editDoc.path}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-gray-100"
            />
          </div>

          {/* Current File */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current File</label>
            {editDoc.mime_type.startsWith("image/") ? (
              <img
                src={`http://localhost:8000/storage/${editDoc.path}`}
                alt="Current file"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            ) : (
              <a
                href={`http://localhost:8000/storage/${editDoc.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-2"
              >
                <FileText size={16} /> {editDoc.name}
              </a>
            )}
          </div>

          {/* Replace Document */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Replace Document</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                        file:rounded-lg file:border-0 file:text-sm file:font-semibold 
                        file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setIsEditOpen(false)}
          className="px-5 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateDocument}
          className="px-5 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md transition"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </DashboardLayout>
  );
}
