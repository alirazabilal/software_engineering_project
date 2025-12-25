import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AudioUpload from './components/AudioUpload';
import TranscriptViewer from './components/TranscriptViewer';
import QuizGenerator from './components/QuizGenerator';
import QuizViewer from './components/QuizViewer';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [audioData, setAudioData] = useState(null);
  const [transcriptData, setTranscriptData] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    setShowDashboard(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setShowDashboard(true);
    handleReset();
  };

  const handleStartNewQuiz = () => {
    setShowDashboard(false);
    setCurrentStep(1);
    setAudioData(null);
    setTranscriptData(null);
    setQuizData(null);
    setError(null);
  };

  const handleBackToDashboard = () => {
    setShowDashboard(true);
    setCurrentStep(1);
    setAudioData(null);
    setTranscriptData(null);
    setQuizData(null);
    setError(null);
  };

  const handleAudioUploaded = (data) => {
    setAudioData(data);
    setCurrentStep(2);
    setError(null);
  };

  const handleTranscriptionComplete = (data) => {
    setTranscriptData(data);
    setCurrentStep(3);
    setError(null);
  };

  const handleQuizGenerated = (data) => {
    setQuizData(data);
    setCurrentStep(4);
    setError(null);
  };

  const handleReset = () => {
    setShowDashboard(true);
    setCurrentStep(1);
    setAudioData(null);
    setTranscriptData(null);
    setQuizData(null);
    setError(null);
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (showDashboard) {
    return (
      <Dashboard
        user={user}
        token={token}
        onLogout={handleLogout}
        onStartNewQuiz={handleStartNewQuiz}
      />
    );
  }

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div>
              <h1>🎙️ Voice-to-Quiz App</h1>
              <p>Transform your lecture audio into interactive quizzes instantly</p>
            </div>
            <div className="header-actions">
              <button onClick={handleBackToDashboard} className="btn-back">
                ← Dashboard
              </button>
              <button onClick={handleLogout} className="btn-logout-small">
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="main-content">
          <div className="steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <h3>Upload Audio</h3>
              <p>Record or upload lecture</p>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <h3>Transcribe</h3>
              <p>Convert speech to text</p>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <h3>Generate Quiz</h3>
              <p>Create questions with AI</p>
            </div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <h3>Take Quiz</h3>
              <p>Attempt & export</p>
            </div>
          </div>

          {error && (
            <div className="error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {currentStep === 1 && (
            <AudioUpload
              token={token}
              onUploadSuccess={handleAudioUploaded}
              onError={setError}
            />
          )}

          {currentStep === 2 && audioData && (
            <TranscriptViewer
              audioData={audioData}
              token={token}
              onTranscriptionComplete={handleTranscriptionComplete}
              onError={setError}
            />
          )}

          {currentStep === 3 && transcriptData && (
            <QuizGenerator
              transcriptData={transcriptData}
              audioData={audioData}
              token={token}
              onQuizGenerated={handleQuizGenerated}
              onError={setError}
            />
          )}

          {currentStep === 4 && quizData && (
            <QuizViewer
              quizData={quizData}
              token={token}
              onReset={handleReset}
              onError={setError}
            />
          )}
        </div>

        <footer className="footer">
          <p>© 2025 Voice-to-Quiz App | BSCS22138 & BSCS22108 | Software Engineering Project</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
