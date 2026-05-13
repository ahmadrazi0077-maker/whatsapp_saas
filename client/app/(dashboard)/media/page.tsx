'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image, File, Video, Music, Trash2, Download, Copy, Loader2, Search, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function MediaPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [previewFile, setPreviewFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadFiles(); }, []);

  const getToken = () => localStorage.getItem('token');

  const loadFiles = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_URL}/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setFiles(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Create a local URL for preview
      const url = URL.createObjectURL(file);
      
      const token = getToken();
      const res = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: file.name,
          type: getFileType(file.type),
          size: formatFileSize(file.size),
          url: url,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(`"${file.name}" uploaded successfully!`);
        setTimeout(() => setSuccess(''), 3000);
        loadFiles();
      }
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('File deleted');
      setTimeout(() => setSuccess(''), 3000);
      loadFiles();
    } catch (err) { setError('Failed to delete'); }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSuccess('URL copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleDownload = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'image': return <Image className="h-8 w-8 text-blue-500" />;
      case 'video': return <Video className="h-8 w-8 text-purple-500" />;
      case 'audio': return <Music className="h-8 w-8 text-orange-500" />;
      default: return <File className="h-8 w-8 text-gray-500 dark:text-gray-400 dark:text-gray-500" />;
    }
  };

  const filtered = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || f.type === filterType;
    return matchSearch && matchType;
  });

  const typeCounts = {
    all: files.length,
    image: files.filter(f => f.type === 'image').length,
    video: files.filter(f => f.type === 'video').length,
    audio: files.filter(f => f.type === 'audio').length,
    document: files.filter(f => f.type === 'document').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="h-12 w-12 text-whatsapp-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Media Library</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Upload className="h-5 w-5" />} onClick={() => fileInputRef.current?.click()}>
          Upload Files
        </Button>
        <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" multiple />
      </div>

      {success && <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Upload Zone */}
      <Card className="p-0 overflow-hidden">
        <div className="p-8 border-2 border-dashed border-gray-300 text-center hover:border-whatsapp-green transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {uploading ? 'Uploading...' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">or click to browse. Max file size: 16MB</p>
          {uploading && <Loader2 className="h-6 w-6 text-whatsapp-green animate-spin mx-auto mt-3" />}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search files..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
        </div>
        <div className="flex gap-1">
          {Object.entries(typeCounts).map(([type, count]) => (
            <button key={type} onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterType === type ? 'bg-whatsapp-green text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}>
              {type} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Image className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-lg">No files found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Upload your first file to get started</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(file => (
            <Card key={file.id} className="p-4 hover:shadow-md transition-shadow group">
              {/* Preview */}
              <div className="flex items-center justify-center h-40 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3 overflow-hidden relative"
                onClick={() => setPreviewFile(file)}>
                {file.type === 'image' && file.url ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover cursor-pointer" />
                ) : (
                  getIcon(file.type)
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:bg-gray-700">
                    <Eye className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleCopyUrl(file.url); }}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:bg-gray-700">
                    <Copy className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                  {file.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  <span>{file.size}</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 mt-3 pt-3 border-t">
                <button onClick={() => handleDownload(file.url, file.name)}
                  className="flex-1 p-1.5 hover:bg-gray-100 dark:bg-gray-700 rounded text-xs flex items-center justify-center gap-1">
                  <Download className="h-3 w-3" /> Download
                </button>
                <button onClick={() => handleDelete(file.id)}
                  className="flex-1 p-1.5 hover:bg-red-50 rounded text-xs flex items-center justify-center gap-1 text-red-500">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-gray-100 dark:bg-gray-700 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              {previewFile.type === 'image' ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-[60vh] object-contain rounded" />
              ) : (
                <div className="text-center py-12">
                  {getIcon(previewFile.type)}
                  <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-4">Preview not available for this file type</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex justify-between text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              <span>{previewFile.size}</span>
              <span>{new Date(previewFile.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
