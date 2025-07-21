/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from "@/app/components/DashboardLayout";
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
  year: string; // e.g. "2025"
}

export default function DocumentsByYear({ year }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`http://localhost:8000/api/documents?folder=documents/${year}`);

        if (!res.ok) {
          throw new Error(`Failed to load documents: ${res.statusText}`);
        }

        const data = await res.json();
        // assuming your API returns paginated or raw list in data.data or data
        setDocuments(data.data || data);
      } catch (err: any) {
        setError(err.message || 'Error loading documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [year]);

  return (
    <DashboardLayout>
    <div className="max-w-5xl mx-auto p-6 bg-white text-black rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Documents in folder: {year}</h1>

      {loading && <p>Loading documents...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && documents.length === 0 && (
        <p className="text-gray-500">No documents found in folder {year}.</p>
      )}

      {!loading && !error && documents.length > 0 && (
        <table className="w-full table-auto border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Size (KB)</th>
              <th className="px-4 py-2 border">Uploaded</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="text-sm">
                <td className="px-4 py-2 border">{doc.name}</td>
                <td className="px-4 py-2 border">{doc.description || '—'}</td>
                <td className="px-4 py-2 border">{doc.mime_type}</td>
                <td className="px-4 py-2 border">{(doc.size / 1024).toFixed(1)}</td>
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
      )}
    </div>
    </DashboardLayout>
  );
}
