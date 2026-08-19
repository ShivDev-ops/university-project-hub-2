'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileArchive } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImportPortfolioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('bundle', file);

      // In a real implementation, you'd send this to your API that unpacks the ZIP,
      // parses the manifest, and inserts into DB.
      // E.g.: await fetch('/api/import/bundle', { method: 'POST', body: formData })

      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('success');
      setTimeout(() => {
        router.push('/portfolio');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to upload portfolio bundle.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 px-6 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white tracking-tighter mb-4">Manual Portfolio Import</h1>
          <p className="text-zinc-400">
            Upload your Hack-Flow `.zip` export bundle here to permanently archive your hackathon project.
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl glass-panel relative overflow-hidden">
          {status === 'success' && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
              <CheckCircle className="text-emerald-500 w-16 h-16 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Import Successful</h2>
              <p className="text-emerald-500/80 text-sm">Redirecting to your portfolios...</p>
            </div>
          )}

          <div 
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${
              file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'
            }`}
          >
            <input 
              type="file" 
              accept=".zip" 
              onChange={handleFileChange}
              className="hidden" 
              id="file-upload" 
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              {file ? (
                <>
                  <FileArchive className="text-emerald-500 w-12 h-12 mb-4" />
                  <div className="text-emerald-400 font-bold">{file.name}</div>
                  <div className="text-xs text-zinc-500 mt-2 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </>
              ) : (
                <>
                  <UploadCloud className="text-zinc-500 w-12 h-12 mb-4" />
                  <div className="text-zinc-300 font-bold mb-2">Click to browse or drag and drop</div>
                  <div className="text-xs text-zinc-600 font-mono">.ZIP export bundles only (Max 50MB)</div>
                </>
              )}
            </label>
          </div>

          {status === 'error' && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertTriangle className="shrink-0 w-5 h-5" />
              <div>{errorMessage}</div>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-4">
            <button 
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors text-sm font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={!file || status === 'uploading'}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              {status === 'uploading' ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-zinc-950/30 border-t-zinc-950 animate-spin" />
                  Processing...
                </>
              ) : 'Confirm Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
