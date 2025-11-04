/* eslint-disable react/prop-types */
import axios from "axios";
import { BookOpen, Settings, Trash2, Unlink, Upload, FileText, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Handle, Position } from "reactflow";
import toast from 'react-hot-toast';

const KnowledgeBaseNode = ({ data, selected, id }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileInputRef, setFileInputRef] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    setIsUploading(true);
    
    const uploadToast = toast.loading(
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div>
          <p className="font-semibold text-gray-800">Uploading Document</p>
          <p className="text-sm text-gray-600">Processing {file.name}...</p>
        </div>
      </div>,
      {
        duration: Infinity,
        style: {
          background: '#f0f9ff',
          color: '#0369a1',
          border: '1px solid #bae6fd',
          minWidth: '320px',
        }
      }
    );

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file:", file.name, file.type);

      const response = await axios.post(
        "http://localhost:8000/api/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Backend response:", response.data);

      toast.success(
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-gray-800">Document Uploaded!</p>
            <p className="text-sm text-gray-600">{file.name} processed successfully</p>
          </div>
        </div>,
        {
          id: uploadToast,
          duration: 4000,
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            minWidth: '320px',
          }
        }
      );

      if (response.data.file_id) {
        console.log("File processed with ID:", response.data.file_id);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      
      let errorMessage = "Upload failed: Could not connect to server";
      if (err.response) {
        console.error("Response error:", err.response.data);
        errorMessage = `Upload failed: ${err.response.data.detail || "Unknown error"}`;
      }

      toast.error(
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-semibold text-gray-800">Upload Failed</p>
            <p className="text-sm text-gray-600">{errorMessage}</p>
          </div>
        </div>,
        {
          id: uploadToast,
          duration: 5000,
          style: {
            background: '#fef3f2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            minWidth: '320px',
          }
        }
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf" || file.type === "text/plain") {
        setUploadedFile(file);
        handleUploadToBackend(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          console.log("File content:", event.target.result);
        };
        reader.readAsText(file);
      } else {
        toast.error(
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-gray-800">Invalid File Type</p>
              <p className="text-sm text-gray-600">Please upload a PDF or text file only</p>
            </div>
          </div>,
          {
            duration: 4000,
            style: {
              background: '#fef3f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              minWidth: '320px',
            }
          }
        );
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      handleUploadToBackend(file);
      const reader = new FileReader();
      reader.onload = (event) =>
        console.log("File content:", event.target.result);
      reader.readAsText(file);
      e.target.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUploadClick = () => {
    if (!isUploading) {
      fileInputRef?.click();
    }
  };

  return (
    <div
      className={`shadow-lg rounded-lg bg-white min-w-80 ${
        selected ? "ring-2 ring-gray-300" : ""
      }`}
    >
      {showSettings && (
        <div
          ref={settingsRef}
          className="absolute right-2 top-12 bg-white rounded-lg shadow-xl z-10 min-w-48"
        >
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
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 p-0.75 mt-35 !bg-orange-600"
      />
      <div className="px-5 py-3 flex items-center justify-between gap-3 border-b-3 border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <BookOpen className="w-6 h-6 text-gray-600" />
          <h2 className="font-semibold text-gray-800 text-lg">
            Knowledge Base
          </h2>
        </div>
        <button
          className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
            showSettings
              ? "bg-gray-100 text-blue-600"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      <div>
        <div className="text-sm text-gray-600 bg-blue-100 px-5 py-2">
          Let LLM search info in your file
        </div>
      </div>
      <div className="space-y-3 px-5 py-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File for Knowledge Base
          </label>
          <input
            type="file"
            ref={(ref) => setFileInputRef(ref)}
            onChange={handleFileSelect}
            accept=".pdf,.txt"
            className="hidden"
            disabled={isUploading}
          />
          <div
            className={`w-full px-3 py-8 border-2 border-dashed rounded-md text-center text-sm cursor-pointer transition-all ${
              isUploading
                ? 'border-yellow-400 bg-yellow-50 cursor-not-allowed animate-pulse'
                : isDragOver
                ? "border-green-500 bg-green-50"
                : uploadedFile
                ? "border-green-500 bg-green-50"
                : "border-green-300 hover:border-green-400 hover:bg-green-50"
            }`}
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-green-600 font-medium">Uploading...</p>
                <p className="text-xs text-green-500">Processing document</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-5 w-5 text-green-400 mb-2" />
                {uploadedFile ? (
                  <div>
                    <p className="text-green-600 font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-green-500 mt-1">Click to upload different file</p>
                  </div>
                ) : (
                  <div>
                    <p>Upload PDF or Text File</p>
                    <p className="text-xs text-gray-500 mt-1">Drag & drop or click to browse</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Embedding Model
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50">
            <span className="text-green-600 font-medium">all-MiniLM-L6-v2</span>
            <span className="text-gray-500 ml-2">(Local - Free & Fast)</span>
          </div>
        </div>
      </div>
      <h3 className="flex justify-start text-sm ml-2 mt-2 pb-5">Query</h3>
      <h3 className="flex justify-end text-sm mr-2 pb-5">Context</h3>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 p-0.75 mt-45 !bg-orange-500"
      />
    </div>
  );
};

export default KnowledgeBaseNode;