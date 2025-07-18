"use client";

import { useEffect, useRef, useState } from "react";
import { FaFolderPlus, FaUpload } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";

const documentItems = [
  { slug: "reports", name: "Reports", icon: "📄" },
  { slug: "invoices", name: "Invoices", icon: "🧾" },
];

export default function UploadPage() {
  const pathname = usePathname();
  const [folderName, setFolderName] = useState("");
  const [createdFolders, setCreatedFolders] = useState<string[]>([]); // Folders from server
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Modal states for document upload form
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [docTags, setDocTags] = useState(""); // comma separated tags

  useEffect(() => {
    async function fetchFolders() {
      // TODO: fetch real folders from backend
      const folders = ["Documents", "Invoices"]; // mock
      setCreatedFolders(folders);
    }
    fetchFolders();

    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
    }
  }, []);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    // TODO: call backend to create folder

    setCreatedFolders((prev) => [...prev, folderName.trim()]);
    setFolderName("");
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // TODO: send folder files preserving structure to backend
    alert(`Uploading ${files.length} files (mock) - implement backend`);
  };

  const openFolderDialog = () => {
    folderInputRef.current?.click();
  };

  // When user selects file for single file upload, open modal form with that file info
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadFile(file);
    setDocName(file.name);
    setDocDescription("");
    setDocTags("");
    setShowUploadForm(true);
  };

  // Submit document form data + file to backend
  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("name", docName);
    formData.append("description", docDescription);
    formData.append("tags", docTags); // backend can split by comma
    formData.append("file", uploadFile);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      alert("Document uploaded successfully!");
      setShowUploadForm(false);
      setUploadFile(null);
      // Optionally refresh document list or folders here
    } catch (error) {
      alert("Error uploading document: " + (error as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        <nav className="flex flex-col gap-1">
          {documentItems.map((item) => (
            <Link
              key={item.slug}
              href={`/dashboard/documents/${item.slug}`}
              className={`text-sm flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-gray-700 transition ${
                pathname === `/dashboard/documents/${item.slug}`
                  ? "bg-blue-500 text-white"
                  : "text-gray-800 dark:text-gray-200"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Upload Panel */}
      <main className="flex-1 p-6 relative">
        <h1 className="text-2xl font-bold mb-6">Upload Documents</h1>

        {/* Create + Upload Folder Buttons */}
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          {/* Create New Folder */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Create New Folder
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Folder Name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="p-2 border rounded w-64 text-gray-800 dark:text-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700"
              >
                <FaFolderPlus /> Create
              </button>
            </div>
          </div>

          {/* Upload Folder */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Upload Folder
            </label>
            <div className="flex gap-2">
              <button
                onClick={openFolderDialog}
                className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700"
              >
                <FaUpload /> Upload Folder
              </button>
              <input
                ref={folderInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFolderUpload}
              />
            </div>
          </div>
        </div>

        {/* Display Created Folders */}
        {createdFolders.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium mb-2">Folders on Server:</h2>
            <ul className="list-disc ml-6">
              {createdFolders.map((folder, i) => (
                <li key={i}>{folder}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Files */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Upload Files
          </label>
          <input
            type="file"
            multiple={false} // only one file, so form modal can open
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:border file:rounded file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Modal: Upload Document Form */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form
              onSubmit={handleSubmitDocument}
              className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96"
            >
              <h2 className="text-xl font-semibold mb-4">Upload Document</h2>

              <label className="block mb-2 font-medium">Name *</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                className="w-full p-2 mb-4 border rounded text-gray-800 dark:text-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />

              <label className="block mb-2 font-medium">Description</label>
              <textarea
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
                rows={3}
                className="w-full p-2 mb-4 border rounded text-gray-800 dark:text-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />

              <label className="block mb-2 font-medium">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={docTags}
                onChange={(e) => setDocTags(e.target.value)}
                className="w-full p-2 mb-4 border rounded text-gray-800 dark:text-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />

              <label className="block mb-2 font-medium">File *</label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadFile(e.target.files[0]);
                  }
                }}
                required
                className="w-full mb-4"
              />

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
