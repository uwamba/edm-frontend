"use client";

import { useRef, useState, useEffect } from "react";
import { FaFolderPlus, FaUpload } from "react-icons/fa";

export default function UploadPage() {
  const [folderName, setFolderName] = useState("");
  const [createdFolders, setCreatedFolders] = useState<string[]>([]);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    setCreatedFolders([...createdFolders, folderName.trim()]);
    setFolderName("");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log(
        "Uploading files:",
        Array.from(files).map((f) => (f as any).webkitRelativePath || f.name)
      );
      // Add upload logic here
    }
  };

  const openFolderDialog = () => {
    folderInputRef.current?.click();
  };

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "true");
      folderInputRef.current.setAttribute("directory", ""); // for Firefox compatibility
    }
  }, []);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Upload Documents
      </h1>

      {/* Create New Folder */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
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

        {createdFolders.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Created Folders:
            </h2>
            <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300">
              {createdFolders.map((folder, i) => (
                <li key={i}>{folder}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Upload Files */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Upload Files
        </label>
        <input
          type="file"
          multiple
          onChange={handleUpload}
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:border file:rounded file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* Upload Folder */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Upload Folder
        </label>
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
          onChange={handleUpload}
        />
      </div>
    </div>
  );
}
