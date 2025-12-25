import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_BASE = 'http://localhost:5000/api';

function Dashboard({ user, token, onLogout, onStartNewQuiz }) {
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [historyRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/history`, { headers }),
        axios.get(`${API_BASE}/statistics`, { headers })
      ]);

      if (historyRes.data.success) {
        setHistory(historyRes.data.quizzes);
      }

      if (statsRes.data.success) {
        setStatistics(statsRes.data.statistics);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.delete(`${API_BASE}/quiz/${quizId}`, { headers });

      if (response.data.success) {
        setHistory(history.filter(q => q._id !== quizId));
      }
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>Welcome, {user.username}! 👋</h2>
          <p className="user-email">{user.email}</p>
        </div>
        <div className="header-actions">
          <button onClick={onStartNewQuiz} className="btn-new-quiz">
            ➕ New Quiz
          </button>
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      {statistics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.total_quizzes}</div>
              <div className="stat-label">Total Quizzes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.completed_quizzes}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.average_score}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent Quizzes
          </button>
        </div>

        <div className="quiz-history">
          {history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No quizzes yet</h3>
              <p>Create your first quiz by uploading an audio file!</p>
              <button onClick={onStartNewQuiz} className="btn-primary">
                Create Quiz
              </button>
            </div>
          ) : (
            <div className="quiz-list">
              {history.map((quiz) => (
                <div key={quiz._id} className="quiz-card">
                  <div className="quiz-header">
                    <div className="quiz-title">
                      🎵 {quiz.audio_filename}
                    </div>
                    <div className="quiz-actions">
                      <button 
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        className="btn-delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="quiz-meta">
                    <span className="badge">{quiz.difficulty}</span>
                    <span className="quiz-info">{quiz.question_count} questions</span>
                    {quiz.completed && quiz.score !== null && (
                      <span className="quiz-score">Score: {quiz.score}%</span>
                    )}
                  </div>
                  <div className="quiz-date">
                    {formatDate(quiz.created_at)}
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

export default Dashboard;
