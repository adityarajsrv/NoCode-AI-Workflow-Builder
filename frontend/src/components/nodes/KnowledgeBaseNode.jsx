/* eslint-disable react/prop-types */
import { BookOpen, Settings, Trash2, Unlink, Upload, Eye } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import axios from 'axios'; 

const KnowledgeBaseNode = ({ data, selected, id }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileInputRef, setFileInputRef] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteNode = () => {
    if (data.onDelete) data.onDelete(id);
    setShowSettings(false);
  };

  const handleResetConnections = () => {
    if (data.onResetConnections) data.onResetConnections(id);
    setShowSettings(false);
  };

  const handleUploadToBackend = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Backend response:', response.data);
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('File upload failed. Check console for details.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        setUploadedFile(file);
        handleUploadToBackend(file); 
        const reader = new FileReader();
        reader.onload = (event) => {
          console.log('File content:', event.target.result);
        };
        reader.readAsText(file);
      } else alert('Please upload a PDF or text file only.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      handleUploadToBackend(file); 
      const reader = new FileReader();
      reader.onload = (event) => console.log('File content:', event.target.result);
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleUploadClick = () => { fileInputRef?.click(); };
  const toggleApiKeyVisibility = () => setShowApiKey(!showApiKey);

  return (
    <div className={`shadow-lg rounded-lg bg-white  min-w-80 ${selected ? 'ring-2 ring-gray-300' : ''}`}>
      {showSettings && (
        <div ref={settingsRef} className="absolute right-2 top-12 bg-white rounded-lg shadow-xl z-10 min-w-48">
          <div className="p-1">
            <button
              onClick={handleResetConnections}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Unlink className="w-4 h-4 text-orange-600" />
              <span>Reset Connections</span>
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              onClick={handleDeleteNode}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Node</span>
            </button>
          </div>
        </div>
      )}
      <Handle type="target" position={Position.Left} className="w-3 h-3 p-0.75 mt-44 !bg-orange-600" />      
      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b-3 border-gray-200">
        <div className='flex items-center justify-between gap-3'>
          <BookOpen className="w-6 h-6 text-gray-600" />
          <h2 className="font-semibold text-gray-800 text-lg">Knowledge Base</h2>
        </div>
        <button
          className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
            showSettings ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
          }`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      <div>
        <div className="text-sm text-gray-600 bg-blue-100 px-5 py-2">Let LLM search info in your file</div>
      </div>
      <div className="space-y-3 px-5 py-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File for Knowledge Base</label>
          <input
            type="file"
            ref={(ref) => setFileInputRef(ref)}
            onChange={handleFileSelect}
            accept=".pdf,.txt"
            className="hidden"
          />
          <div
            className={`w-full px-3 py-8 border-2 border-dashed rounded-md text-center text-sm cursor-pointer transition-colors ${
              isDragOver
                ? 'border-green-500 bg-green-50'
                : uploadedFile
                ? 'border-green-500 bg-green-50'
                : 'border-green-300 hover:border-green-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <Upload className="mx-auto h-5 w-5 text-green-400 mb-2" />
            {uploadedFile ? (
              <p className="text-green-600 font-medium">{uploadedFile.name}</p>
            ) : (
              <p>Upload File</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Embedding Model</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent">
            <option>text-embedding-3-large</option>
            <option>text-embedding-3-small</option>
            <option>text-embedding-ada-002</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <div className="relative">
            <input 
              type={showApiKey ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
              placeholder="Enter your Gemini API key"
            />
            <button
              type="button"
              onClick={toggleApiKeyVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>       
      </div>
      <h3 className="flex justify-start text-sm ml-2 mt-2 pb-5">Query</h3>
      <h3 className="flex justify-end text-sm mr-2 pb-5">Context</h3>
      <Handle type="source" position={Position.Right} className="w-3 h-3 p-0.75 mt-54 !bg-orange-500" />
    </div>
  );
};

export default KnowledgeBaseNode;