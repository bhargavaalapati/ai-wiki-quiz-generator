import React, { useState } from 'react';
import FlashcardDeck from './FlashcardDeck';

// InfoCard helper remains the same
const InfoCard = ({ title, children }) => (
  <div className="card h-100">
    <div className="card-body">
      <h5 className="card-title text-muted">{title}</h5>
      {children}
    </div>
  </div>
);

const QuizDisplay = ({ data }) => {
  // --- FIX: ALL HOOKS MUST BE AT THE TOP ---
  // 'view' = default, 'quiz' = taking quiz, 'result' = quiz graded
  const [mode, setMode] = useState('view'); 
  const [userAnswers, setUserAnswers] = useState({}); // Stores { qIndex: "answer text" }
  const [score, setScore] = useState(null); // Stores { correct: 0, total: 0 }
  // ---------------------------------------

  // --- NOW we can have the early return ---
  if (!data) {
    // We still have to return *something* because the hooks were called
    // but this component won't be rendered anyway if data is null.
    // Returning null here is fine.
    return null;
  }
  
  const handleAnswerChange = (qIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [qIndex]: answer,
    }));
  };

  const gradeQuiz = () => {
    let correct = 0;
    data.quiz.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        correct++;
      }
    });
    setScore({ correct, total: data.quiz.length });
    setMode('result'); // Set mode to 'result' to show score
  };

  const startQuiz = () => {
    setUserAnswers({});
    setScore(null);
    setMode('quiz');
  };

  const viewAnswers = () => {
    setMode('view'); // Go back to default view
  }
  
  // Helper to determine list item class based on mode
  const getOptionClass = (q, option, qIndex) => {
    const isCorrect = option === q.answer;
    const isUserChoice = userAnswers[qIndex] === option;

    if (mode === 'result') {
      if (isCorrect) return 'list-group-item list-group-item-success fw-bold';
      if (isUserChoice && !isCorrect) return 'list-group-item list-group-item-danger';
    }
    if (mode === 'view' && isCorrect) {
      return 'list-group-item list-group-item-success fw-bold';
    }
    return 'list-group-item';
  };

  return (
    <div className="container-fluid">
      <h2 className="h2 mb-3">{data.title}</h2>
      
      {/* --- Summary & Info --- */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <InfoCard title="Article Summary">
            <p className="card-text">{data.summary}</p>
          </InfoCard>
        </div>
        <div className="col-md-3">
          <InfoCard title="Key Entities">
            {Object.entries(data.key_entities).map(([type, list]) => (
              <div key={type}>
                <strong className="text-capitalize">{type}:</strong>
                <span className="text-body-secondary ms-2">{list.join(', ') || 'N/A'}</span>
              </div>
            ))}
          </InfoCard>
        </div>
        <div className="col-md-3">
          <InfoCard title="Related Topics">
            <ul className="list-unstyled mb-0">
              {data.related_topics.map((topic, i) => (
                <li key={i}>{topic}</li>
              ))}
            </ul>
          </InfoCard>
        </div>
      </div>

      {/* --- Quiz Questions --- */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="h3 mb-0">Generated Quiz</h3>
          
          {/* --- BONUS: Quiz Mode Buttons --- */}
          {mode === 'view' && (
            <button className="btn btn-success btn-lg" onClick={startQuiz}>
              Take Quiz!
            </button>
          )}
          {mode === 'quiz' && (
            <button className="btn btn-warning btn-lg" onClick={viewAnswers}>
              View Answers
            </button>
          )}
          {mode === 'result' && (
            <button className="btn btn-primary btn-lg" onClick={startQuiz}>
              Take Again
            </button>
          )}
          {/* --------------------------------- */}
        </div>

        {/* --- BONUS: Show Score --- */}
        {mode === 'result' && score && (
          <div className="alert alert-info text-center h4">
            Your Score: {score.correct} / {score.total}
          </div>
        )}
        {/* --------------------------- */}
        
        <div className="vstack gap-4">
          {data.quiz.map((q, index) => (
            <div key={index} className="card shadow-sm border-start border-primary border-5">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <p className="h5">Question {index + 1}</p>
                  <span className="badge bg-primary text-capitalize rounded-pill">
                    {q.difficulty}
                  </span>
                </div>
                <p className="card-text fs-5 mb-4">{q.question}</p>
                
                {/* --- BONUS: Dynamic Options --- */}
                {mode === 'quiz' ? (
                  // 'Quiz' Mode: Show radio buttons
                  <div className="vstack gap-2 mb-4">
                    {q.options.map((option, i) => (
                      <div className="form-check" key={i}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name={`question-${index}`}
                          id={`q-${index}-option-${i}`}
                          value={option}
                          onChange={() => handleAnswerChange(index, option)}
                          checked={userAnswers[index] === option}
                        />
                        <label className="form-check-label" htmlFor={`q-${index}-option-${i}`}>
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  // 'View' or 'Result' Mode: Show styled list
                  <ul className="list-group mb-4">
                    {q.options.map((option, i) => (
                      <li key={i} className={getOptionClass(q, option, index)}>
                        {String.fromCharCode(65 + i)}: {option}
                      </li>
                    ))}
                  </ul>
                )}
                {/* ------------------------------ */}
                
                {/* --- BONUS: Hide Explanation in Quiz Mode --- */}
                {mode !== 'quiz' && (
                  <div className="alert alert-warning mb-0">
                    <p className="mb-0"><strong>Explanation:</strong> {q.explanation}</p>
                  </div>
                )}
                {/* ------------------------------------------- */}
              </div>
            </div>
          ))}

          {/* --- BONUS: Grade Button --- */}
          {mode === 'quiz' && (
            <button className="btn btn-success btn-lg mt-4" onClick={gradeQuiz}>
              Grade My Quiz!
            </button>
          )}

            {data.flashcards && data.flashcards.length > 0 && (
            <>
            <hr className="my-5" />
            <FlashcardDeck cards={data.flashcards} />
            </>
         )}
          {/* --------------------------- */}
        </div>
      </div>
    </div>
  );
};

export default QuizDisplay;