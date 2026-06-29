"use client";

import { useEffect, useState } from "react";
import { FileText, Upload, CheckCircle, Clock, ArrowUpCircle } from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  isProcessed: boolean;
  createdAt: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFile(null);
        // Clear input element
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        fetchDocuments();
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to process document");
      }
    } catch (err) {
      console.error(err);
      setError("Network error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <FileText className="w-8 h-8 text-indigo-400" /> Startup Documents
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Upload PDF, Word, or Markdown files. The AI Co-Founder semantically chunks and remembers them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: File Upload Box */}
        <div className="glass-panel rounded-2xl p-6 h-fit space-y-6">
          <h3 className="font-bold text-lg text-white">Index New Document</h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative">
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-zinc-500 mb-3" />
              <p className="text-xs font-bold text-zinc-300">
                {file ? file.name : "Select Document File"}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Supports PDF, DOCX, TXT, MD up to 10MB.
              </p>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Indexing text chunks...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="w-3.5 h-3.5" /> Start Chunk Indexing
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: Documents Inventory List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-lg text-white">Document Inventory</h3>

          {loading && documents.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs font-semibold animate-pulse">
              Loading document index...
            </div>
          ) : documents.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs">
              No business files uploaded to this startup workspace yet.
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-zinc-200 truncate leading-snug">{doc.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded border border-zinc-700">
                          {doc.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {doc.isProcessed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                        <CheckCircle className="w-3.5 h-3.5" /> Chunks Indexed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10 animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Processing...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
