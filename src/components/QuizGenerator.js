import React, { useState } from 'react';
import axios from 'axios';
import { FaBrain, FaCog } from 'react-icons/fa';

const API_BASE = 'http://localhost:5000/api';

function QuizGenerator({ transcriptData, audioData, token, onQuizGenerated, onError }) {
  const [generating, setGenerating] = useState(false);
  const [settings, setSettings] = useState({
    difficulty: 'medium',
    num_questions: 10,
    mcq: true,
    true_false: true,
    short_answer: true,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateQuiz = async () => {
    // Validate at least one question type is selected
    if (!settings.mcq && !settings.true_false && !settings.short_answer) {
      onError('Please select at least one question type.');
      return;
    }

    setGenerating(true);
    onError(null);

    try {
      const questionTypes = [];
      if (settings.mcq) questionTypes.push('mcq');
      if (settings.true_false) questionTypes.push('true_false');
      if (settings.short_answer) questionTypes.push('short_answer');

      const response = await axios.post(`${API_BASE}/generate-quiz`, {
        transcript_text: transcriptData.text,
        filename: audioData.original_filename || audioData.filename,
        difficulty: settings.difficulty,
        num_questions: parseInt(settings.num_questions),
        question_types: questionTypes,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onQuizGenerated(response.data);
      } else {
        onError(response.data.error || 'Quiz generation failed');
      }
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to generate quiz');
      console.error('Quiz generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="section">
      <h2>
        <FaBrain /> Generate Quiz
      </h2>

      <div className="info">
        <FaCog style={{ marginRight: '10px' }} />
        Configure your quiz settings below. The AI will analyze the transcript 
        and create questions based on key concepts.
      </div>

      <div className="quiz-settings">
        <div className="form-group">
          <label>Difficulty Level</label>
          <select
            value={settings.difficulty}
            onChange={(e) => handleSettingChange('difficulty', e.target.value)}
            disabled={generating}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label>Number of Questions</label>
          <input
            type="number"
            min="1"
            max="50"
            value={settings.num_questions}
            onChange={(e) => handleSettingChange('num_questions', e.target.value)}
            disabled={generating}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '20px' }}>
        <label>Question Types (select at least one)</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.mcq}
              onChange={(e) => handleSettingChange('mcq', e.target.checked)}
              disabled={generating}
            />
            Multiple Choice
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.true_false}
              onChange={(e) => handleSettingChange('true_false', e.target.checked)}
              disabled={generating}
            />
            True/False
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.short_answer}
              onChange={(e) => handleSettingChange('short_answer', e.target.checked)}
              disabled={generating}
            />
            Short Answer
          </label>
        </div>
      </div>

      {generating && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Generating quiz questions with AI...</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px', color: '#666' }}>
            Analyzing transcript and creating {settings.num_questions} questions.
          </p>
        </div>
      )}

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={handleGenerateQuiz}
          disabled={generating}
        >
          <FaBrain /> {generating ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>
    </div>
  );
}

export default QuizGenerator;
