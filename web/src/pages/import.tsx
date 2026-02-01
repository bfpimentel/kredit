import { type SubmitEvent, useState } from "react";

import { api } from "@/api";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/api/invoices", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Invoice uploaded successfully!");
      setFile(null);
    } catch (error) {
      console.error("Error uploading invoice:", error);
      setMessage("Failed to upload invoice.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Import Invoice</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".csv,.pdf,.txt"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
              <div className="text-gray-600 mb-2">{file ? file.name : "Click to select a file or drag and drop"}</div>
              <span className="text-sm text-gray-500">CSV, PDF, or Text files</span>
            </label>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}
