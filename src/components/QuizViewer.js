import React, { useState } from 'react';
import axios from 'axios';
import { FaClipboardList, FaDownload, FaRedo, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const API_BASE = 'http://localhost:5000/api';

function QuizViewer({ quizData, token, onReset, onError }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [downloading, setDownloading] = useState(false);

  const quiz = quizData.quiz;
  const questions = quiz.questions || [];

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleExportPDF = async (includeAnswers) => {
    setDownloading(true);
    onError(null);

    try {
      const response = await axios.post(
        `${API_BASE}/export-pdf`,
        {
          quiz_id: quizData.quiz_id,
          include_answers: includeAnswers,
        },
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `quiz_${quizData.quiz_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      onError('Failed to export PDF');
      console.error('PDF export error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      'mcq': 'Multiple Choice',
      'true_false': 'True/False',
      'short_answer': 'Short Answer'
    };
    return labels[type] || type;
  };

  const isAnswerCorrect = (question) => {
    const userAnswer = userAnswers[question.id];
    if (!userAnswer) return null;
    
    if (question.type === 'mcq' || question.type === 'true_false') {
      return userAnswer.toLowerCase() === question.correct_answer.toLowerCase();
    }
    return null; // For short answer     we don't auto check
  };

  return (
    <div className="section">
      <h2>
        <FaClipboardList /> Your Generated Quiz
      </h2>

      <div className="success">
        <FaCheckCircle /> Quiz generated successfully using {quizData.method === 'openai' ? 'OpenAI GPT' : 'Local AI'} model!
      </div>

      <div className="file-info">
        <p><strong>Quiz Title:</strong> {quiz.title}</p>
        <p><strong>Difficulty:</strong> {quiz.difficulty}</p>
        <p><strong>Total Questions:</strong> {quiz.total_questions}</p>
      </div>

      <div className="quiz-container">
        {questions.map((question, index) => (
          <div key={question.id} className="question-card">
            <div className="question-header">
              <span className="question-number">Question {index + 1}</span>
              <span className="question-type">{getQuestionTypeLabel(question.type)}</span>
            </div>

            <p className="question-text">{question.question}</p>

            {/* Multiple Choice Options */}
            {question.type === 'mcq' && (
              <div className="options">
                {question.options.map((option, idx) => {
                  const optionLetter = option.charAt(0);
                  const isSelected = userAnswers[question.id] === optionLetter;
                  const isCorrect = showAnswers && optionLetter === question.correct_answer;
                  
                  return (
                    <div
                      key={idx}
                      className={`option ${isSelected ? 'selected' : ''} ${showAnswers && isCorrect ? 'correct' : ''}`}
                      onClick={() => handleAnswerChange(question.id, optionLetter)}
                      style={{
                        borderColor: showAnswers && isCorrect ? '#28a745' : '',
                        background: showAnswers && isCorrect ? '#d4edda' : ''
                      }}
                    >
                      {option}
                      {showAnswers && isCorrect && <FaCheckCircle style={{ marginLeft: '10px', color: '#28a745' }} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* True/False Options */}
            {question.type === 'true_false' && (
              <div className="options">
                {['True', 'False'].map((option) => {
                  const isSelected = userAnswers[question.id]?.toLowerCase() === option.toLowerCase();
                  const isCorrect = showAnswers && option.toLowerCase() === question.correct_answer.toLowerCase();
                  
                  return (
                    <div
                      key={option}
                      className={`option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAnswerChange(question.id, option)}
                      style={{
                        borderColor: showAnswers && isCorrect ? '#28a745' : '',
                        background: showAnswers && isCorrect ? '#d4edda' : ''
                      }}
                    >
                      {option}
                      {showAnswers && isCorrect && <FaCheckCircle style={{ marginLeft: '10px', color: '#28a745' }} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Short Answer */}
            {question.type === 'short_answer' && (
              <textarea
                className="answer-input"
                placeholder="Type your answer here..."
                value={userAnswers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
            )}

            {/* Show Answer and Explanation */}
            {showAnswers && (
              <>
                <div className="answer-key">
                  <strong>Correct Answer:</strong> {question.correct_answer}
                  {isAnswerCorrect(question) !== null && (
                    <span style={{ marginLeft: '15px' }}>
                      {isAnswerCorrect(question) ? (
                        <><FaCheckCircle style={{ color: '#28a745' }} /> Correct!</>
                      ) : (
                        <><FaTimesCircle style={{ color: '#dc3545' }} /> Incorrect</>
                      )}
                    </span>
                  )}
                </div>
                {question.explanation && (
                  <div className="explanation">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? 'Hide Answers' : 'Show Answers & Check'}
        </button>
        
        <button
          className="btn btn-success"
          onClick={() => handleExportPDF(true)}
          disabled={downloading}
        >
          <FaDownload /> {downloading ? 'Exporting...' : 'Export with Answers'}
        </button>
        
        <button
          className="btn btn-success"
          onClick={() => handleExportPDF(false)}
          disabled={downloading}
        >
          <FaDownload /> {downloading ? 'Exporting...' : 'Export (Quiz Only)'}
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={onReset}
        >
          <FaRedo /> Start New Quiz
        </button>
      </div>

      <div className="info" style={{ marginTop: '20px' }}>
        <strong>Tip:</strong> Click "Show Answers & Check" to see correct answers and explanations. 
        Export the quiz as PDF for offline use or printing.
      </div>
    </div>
  );
}

export default QuizViewer;
