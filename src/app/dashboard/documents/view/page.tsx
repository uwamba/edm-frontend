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


  <div className="relative overflow-x-auto overflow-y-auto max-h-[500px] border rounded shadow-sm">


        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          {/* Search Input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Mime Type Filter */}
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
              <th className="px-4 py-3 border border-gray-300 text-left">
                <div className="flex items-center gap-1">
                  <FileText size={14} />
                  Type
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-300 text-left">
                <div className="flex items-center gap-1">
                  <File size={14} />
                  Name
                </div>
              </th>
              <th className="px-4 py-3 border border-gray-300 text-left">Description</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Mime Type</th>
              <th className="px-4 py-3 border border-gray-300 text-right">Size (KB)</th>
              <th className="px-4 py-3 border border-gray-300 text-left">Uploaded</th>
              <th className="px-4 py-3 border border-gray-300 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((doc, idx) => (
              <tr
                key={doc.id}
                className={`transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100 text-gray-800`}
              >
                <td className="px-4 py-3 border border-gray-300 text-center">
                  {getFileIcon(doc.mime_type)}
                </td>
                <td
                  className="px-4 py-3 border border-gray-300 font-semibold truncate max-w-[200px]"
                  title={doc.name}
                >
                  {doc.name}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-gray-600">
                  {doc.description || '—'}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-gray-500">
                  {doc.mime_type}
                </td>
                <td className="px-4 py-3 border border-gray-300 text-right text-gray-700">
                  {(doc.size / 1024).toFixed(1)} KB
                </td>
                <td className="px-4 py-3 border border-gray-300 text-gray-500 whitespace-nowrap">
                  {new Date(doc.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 border border-gray-300">
                  <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-start items-center gap-2">
                    <a
                      href={`http://localhost:8000/storage/${doc.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline px-2 py-1 rounded hover:bg-blue-100 transition"
                      aria-label={`View ${doc.name}`}
                    >
                      <Eye size={16} />
                      View
                    </a>
                    <button
                      onClick={() => handleEdit(doc)}
                      className="inline-flex items-center gap-1 text-yellow-600 hover:underline px-2 py-1 rounded hover:bg-yellow-100 transition"
                      aria-label={`Edit ${doc.name}`}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleShare(doc)}
                      className="inline-flex items-center gap-1 text-green-600 hover:underline px-2 py-1 rounded hover:bg-green-100 transition"
                      aria-label={`Share ${doc.name}`}
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:underline px-2 py-1 rounded hover:bg-red-100 transition"
                      aria-label={`Delete ${doc.name}`}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>



    </DashboardLayout >
  );
}
