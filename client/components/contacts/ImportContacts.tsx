'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ImportContactsProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function ImportContacts({ onSuccess, onClose }: ImportContactsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setFile(file);
    } else {
      toast.error('Please upload a CSV file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1
  });

  const handleImport = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Imported ${data.count} contacts successfully!`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch (error) {
      toast.error('Failed to import contacts');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Import Contacts</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p>Drop the CSV file here...</p>
          ) : (
            <div>
              <p className="text-gray-600">Drag & drop a CSV file here</p>
              <p className="text-sm text-gray-500 mt-1">or click to select</p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleImport}
            disabled={!file || uploading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Importing...' : 'Import Contacts'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>CSV Format:</p>
          <code className="block bg-gray-100 p-2 rounded mt-1">
            phone_number,name,email,tags<br />
            +923001234567,John Doe,john@example.com,customer|vip<br />
            +923008765432,Jane Smith,jane@example.com,lead
          </code>
        </div>
      </div>
    </div>
  );
}
