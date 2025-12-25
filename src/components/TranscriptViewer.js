import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileAlt, FaCheckCircle } from 'react-icons/fa';

const API_BASE = 'http://localhost:5000/api';

function TranscriptViewer({ audioData, token, onTranscriptionComplete, onError }) {
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState(null);

  useEffect(() => {
    handleTranscribe();
  }, []);

  const handleTranscribe = async () => {
    setTranscribing(true);
    onError(null);

    try {
      const response = await axios.post(`${API_BASE}/transcribe`, {
        filename: audioData.filename,
        language: 'en', 
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTranscript(response.data);
      } else {
        onError(response.data.error || 'Transcription failed');
      }
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to transcribe audio. Try a different audio file with clearer speech.');
      console.error('Transcription error:', err);
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className="section">
      <h2>
        <FaFileAlt /> Audio Transcription
      </h2>

      {transcribing && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Transcribing audio using Whisper AI...</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px', color: '#666' }}>
            This may take a few moments depending on the audio length.
          </p>
        </div>
      )}

      {transcript && !transcribing && (
        <>
          <div className="success">
            <FaCheckCircle /> Transcription completed successfully!
          </div>

          <div className="file-info">
            <p><strong>Language Detected:</strong> {transcript.language || 'English'}</p>
            <p><strong>Word Count:</strong> {transcript.word_count}</p>
            {transcript.duration && (
              <p><strong>Audio Duration:</strong> {Math.floor(transcript.duration / 60)}:{(transcript.duration % 60).toFixed(0).padStart(2, '0')} minutes</p>
            )}
          </div>

          <div className="transcript-box">
            <h3 style={{ marginBottom: '15px' }}>Transcript:</h3>
            <p>{transcript.text}</p>
          </div>

          <div className="info" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <strong>📝 Review Your Transcript:</strong> Please check the transcript above for accuracy. 
            If it looks good, proceed to generate quiz questions. If there are errors, try uploading 
            a clearer audio file.
          </div>

          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={() => onTranscriptionComplete(transcript)}
            >
              ✓ Transcript Looks Good - Continue to Quiz Generation →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TranscriptViewer;
