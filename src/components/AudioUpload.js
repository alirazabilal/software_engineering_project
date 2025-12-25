import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaCloudUploadAlt, FaMicrophone, FaFile } from 'react-icons/fa';

const API_BASE = 'http://localhost:5000/api';

function AudioUpload({ token, onUploadSuccess, onError }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a', 'audio/ogg'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      onError('Invalid file type. Please upload MP3, WAV, M4A, or OGG files.');
      return;
    }

    if (selectedFile.size > maxSize) {
      onError('File too large. Maximum size is 50MB.');
      return;
    }

    setFile(selectedFile);
    onError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      onError('Please select a file first.');
      return;
    }

    setUploading(true);
    onError(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.data.success) {
        onUploadSuccess(response.data);
      } else {
        onError(response.data.error || 'Upload failed');
      }
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to upload audio file');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="section">
      <h2>
        <FaCloudUploadAlt /> Upload Lecture Audio
      </h2>

      <div
        className={`upload-area ${dragging ? 'dragging' : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          {file ? <FaFile /> : <FaCloudUploadAlt />}
        </div>
        <h3>{file ? file.name : 'Click or drag to upload audio file'}</h3>
        <p>Supported formats: MP3, WAV, M4A, OGG (Max: 50MB)</p>
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          accept=".mp3,.wav,.m4a,.ogg,audio/*"
          onChange={handleFileSelect}
        />
      </div>

      {file && !uploading && (
        <div className="file-info">
          <p><strong>File Name:</strong> {file.name}</p>
          <p><strong>File Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          <p><strong>File Type:</strong> {file.type || 'Unknown'}</p>
        </div>
      )}

      {uploading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Uploading audio file...</p>
        </div>
      )}

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          <FaCloudUploadAlt /> {uploading ? 'Uploading...' : 'Upload & Continue'}
        </button>
      </div>

      <div className="info">
        <strong>Note:</strong> For best results, use clear audio recordings of lectures 
        with minimal background noise.
      </div>
    </div>
  );
}

export default AudioUpload;
