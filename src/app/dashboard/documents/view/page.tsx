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
  Trash2
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
  if (mime.includes('text')) return <FileText className="text-gray-600" />;
  return <File className="text-gray-400" />;
};

export default function DocumentsByYear({ year }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filtered, setFiltered] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch documents
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

  // Search filter
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

  // DELETE document
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

  // EDIT document (simple example: prompt for new name)
  const handleEdit = async (doc: Document) => {
    const newName = prompt('Enter new name:', doc.name);
    if (!newName || newName.trim() === '' || newName === doc.name) return;
    try {
      const res = await fetch(`http://localhost:8000/api/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error('Failed to update document');
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, name: newName } : d))
      );
      setFiltered((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, name: newName } : d))
      );
    } catch (err) {
      alert('Error updating document');
      console.error(err);
    }
  };

  // SHARE document (copy link)
  const handleShare = (doc: Document) => {
    const shareUrl = `http://localhost:8000/storage/${doc.path}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('Document link copied to clipboard!'))
      .catch((err) => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link');
      });
  };

  return (
    <DashboardLayout>


<div className="overflow-x-auto">
  <table className="w-full table-auto border border-gray-300 text-sm shadow-sm rounded-md">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-3 border text-left">Type</th>
        <th className="px-4 py-3 border text-left">Name</th>
        <th className="px-4 py-3 border text-left">Description</th>
        <th className="px-4 py-3 border text-left">Mime Type</th>
        <th className="px-4 py-3 border text-right">Size (KB)</th>
        <th className="px-4 py-3 border text-left">Uploaded</th>
        <th className="px-4 py-3 border text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filtered.map((doc, idx) => (
        <tr
          key={doc.id}
          className={`hover:bg-gray-50 ${
            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          } transition-colors duration-200`}
        >
          <td className="px-4 py-2 border text-center text-black">{getFileIcon(doc.mime_type)}</td>
          <td className="px-4 py-2 border font-medium">{doc.name}</td>
          <td className="px-4 py-2 border">{doc.description || '—'}</td>
          <td className="px-4 py-2 border">{doc.mime_type}</td>
          <td className="px-4 py-2 border text-right">{(doc.size / 1024).toFixed(1)}</td>
          <td className="px-4 py-2 border">{new Date(doc.created_at).toLocaleString()}</td>
          <td className="px-4 py-2 border space-x-2 flex justify-center items-center">
            <a
              href={`http://localhost:8000/storage/${doc.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline px-2 py-1 rounded hover:bg-blue-100 transition"
              aria-label={`View ${doc.name}`}
            >
              <Eye size={16} />
              View
            </a>
            <button
              onClick={() => handleEdit(doc)}
              className="flex items-center gap-1 text-yellow-600 hover:underline px-2 py-1 rounded hover:bg-yellow-100 transition"
              aria-label={`Edit ${doc.name}`}
            >
              <Pencil size={16} />
              Edit
            </button>
            <button
              onClick={() => handleShare(doc)}
              className="flex items-center gap-1 text-green-600 hover:underline px-2 py-1 rounded hover:bg-green-100 transition"
              aria-label={`Share ${doc.name}`}
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={() => handleDelete(doc.id)}
              className="flex items-center gap-1 text-red-600 hover:underline px-2 py-1 rounded hover:bg-red-100 transition"
              aria-label={`Delete ${doc.name}`}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </DashboardLayout>
  );
}
