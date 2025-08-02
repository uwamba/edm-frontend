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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 bg-white text-black rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Documents in folder: {year}</h1>
          <input
            type="text"
            placeholder="Search documents..."
            className="border px-3 py-1 rounded w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <p>Loading documents...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-gray-500">No documents found.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Description</th>
                  <th className="px-4 py-2 border">Mime Type</th>
                  <th className="px-4 py-2 border">Size (KB)</th>
                  <th className="px-4 py-2 border">Uploaded</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{getFileIcon(doc.mime_type)}</td>
                    <td className="px-4 py-2 border">{doc.name}</td>
                    <td className="px-4 py-2 border">{doc.description || '—'}</td>
                    <td className="px-4 py-2 border">{doc.mime_type}</td>
                    <td className="px-4 py-2 border text-right">{(doc.size / 1024).toFixed(1)}</td>
                    <td className="px-4 py-2 border">{new Date(doc.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 border">
                      <a
                        href={`http://localhost:8000/storage/${doc.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
