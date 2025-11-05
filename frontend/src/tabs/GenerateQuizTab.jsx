import React, { useState } from 'react';
import { generateQuiz } from '../services/api';
import QuizDisplay from '../components/QuizDisplay';

// --- FIX: Accept onQuizGenerated prop ---
const GenerateQuizTab = ({ onQuizGenerated }) => {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/Independence');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [quizData, setQuizData] = useState(null);

  // --- BONUS: Input Validation State ---
  const [inputError, setInputError] = useState(null);
  const wikiRegex = /^https:\/\/en\.wikipedia\.org\/wiki\/.+/;
  // ------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setInputError(null);

    // --- BONUS: Input Validation Check ---
    if (!wikiRegex.test(url)) {
      setInputError('Invalid URL. Must be a full "https://en.wikipedia.org/wiki/..." article link.');
      return;
    }
    // ------------------------------------

    if (!url) {
      setApiError('Please enter a Wikipedia URL'); // Kept this just in case
      return;
    }
    
    setLoading(true);
    setQuizData(null);

    try {
      const response = await generateQuiz(url);
      setQuizData(response.data);
      
      // --- FIX: Call prop to notify parent of new quiz ---
      if (onQuizGenerated) {
        onQuizGenerated();
      }
      // ---------------------------------------------------

    } catch (err) {
      setApiError(err.response?.data?.detail || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    // Clear errors on new input
    if (inputError) setInputError(null);
    if (apiError) setApiError(null);
  };

  return (
    <div className="p-4 shadow-sm border rounded">
      {/* --- Input Form --- */}
      <form onSubmit={handleSubmit} className="mb-4">
        <label htmlFor="url-input" className="form-label">
          Enter Wikipedia Article URL
        </label>
        <div className="input-group">
          <input
            type="url"
            id="url-input"
            value={url}
            onChange={handleUrlChange} // Use new handler
            placeholder="https://en.wikipedia.org/wiki/..."
            // --- BONUS: Show invalid state ---
            className={`form-control form-control-lg ${inputError ? 'is-invalid' : ''}`}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating...
              </>
            ) : 'Generate Quiz'}
          </button>
        </div>
        
        {/* --- BONUS: Show input error message --- */}
        {inputError && (
          <div className="invalid-feedback d-block">
            {inputError}
          </div>
        )}
        {/* ------------------------------------- */}
      
      </form>

      {/* --- State Display --- */}
      {loading && (
        <div className="text-center p-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Generating quiz, this may take a moment...</p>
        </div>
      )}

      {apiError && (
        <div className="alert alert-danger" role="alert">
          <strong>Error: </strong> {apiError}
        </div>
      )}

      {/* --- Results Display --- */}
      {quizData && <QuizDisplay data={quizData} />}
    </div>
  );
};

export default GenerateQuizTab;