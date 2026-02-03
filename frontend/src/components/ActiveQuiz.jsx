import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Card, Button } from './StyledUI';
import { theme } from '../theme';

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 1rem;      /* ↓ smaller */
  font-weight: bold;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px 4px;    /* ↓ smaller hitbox */
  line-height: 1;
  border-radius: 4px;
  z-index: 10;

  &:hover {
    color: ${theme.colors.danger};
    background: rgba(220, 38, 38, 0.1);
    transform: scale(1.05); /* ↓ subtler hover */
  }
`;


const QuestionText = styled.h3`
  color: ${theme.colors.primary};
  margin-bottom: 24px;
  padding-right: 20px; /* Prevent text from overlapping the X button */
`;

const OptionButton = styled.button`
  display: block;
  width: 100%;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid ${props => props.borderColor};
  background: ${props => props.bgColor};
  border-radius: 8px;
  text-align: left;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const ScoreBoard = styled.div`
  text-align: center;
  padding: 40px;
  
  h2 { font-size: 3rem; color: ${theme.colors.primary}; margin: 0; }
  p { font-size: 1.2rem; color: ${theme.colors.textMuted}; }
`;

const ActiveQuiz = ({ quizData, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  
  // State for the current question interaction
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Safety check
  if (!quizData || !quizData.quiz || quizData.quiz.length === 0) {
      return <Card>Error loading quiz data.</Card>;
  }

  const currentQuestion = quizData.quiz[currentIndex];

  const handleOptionClick = (option) => {
    if (isAnswered) return; // Prevent multiple clicks

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < quizData.quiz.length) {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowScore(true);
    }
  };

  // Helper to determine button style based on answer state
  const getOptionStyle = (option) => {
    if (!isAnswered) return { borderColor: theme.colors.border, bgColor: theme.colors.surface };

    if (option === currentQuestion.answer) {
      return { borderColor: theme.colors.success, bgColor: '#ecfdf5' }; // Green
    }
    if (option === selectedOption && option !== currentQuestion.answer) {
      return { borderColor: theme.colors.danger, bgColor: '#fef2f2' }; // Red
    }
    return { borderColor: theme.colors.border, bgColor: theme.colors.surface };
  };

  if (showScore) {
    return (
      <Card style={{ position: 'relative' }}>
        <CloseButton onClick={onExit} title="Exit Quiz">✕</CloseButton>
        
        <ScoreBoard>
          <p>Quiz Completed!</p>
          <h2>{score} / {quizData.quiz.length}</h2>
          <p style={{ marginTop: '20px' }}>
            {Math.round((score / quizData.quiz.length) * 100)}% Accuracy
          </p>
          <Button fullWidth onClick={onExit} style={{ marginTop: '20px' }}>
            Review Answers & Exit
          </Button>
        </ScoreBoard>
      </Card>
    );
  }

  return (
    <Card style={{ position: 'relative' }}> {/* Added relative positioning for parent */}
      
      {/* --- 3. ADDED BUTTON HERE (Game View) --- */}
      <CloseButton onClick={onExit} title="Exit Quiz">✕</CloseButton>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', marginTop: '10px' }}>
        <span style={{ fontWeight: 'bold', color: theme.colors.textMuted }}>
          Question {currentIndex + 1} of {quizData.quiz.length}
        </span>
        <span style={{ fontWeight: 'bold', color: theme.colors.primary }}>
          Score: {score}
        </span>
      </div>

      <QuestionText>{currentQuestion.question}</QuestionText>

      <div>
        {currentQuestion.options.map((opt, i) => {
          const styles = getOptionStyle(opt);
          return (
            <OptionButton
              key={i}
              onClick={() => handleOptionClick(opt)}
              borderColor={styles.borderColor}
              bgColor={styles.bgColor}
              disabled={isAnswered}
            >
              <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </OptionButton>
          );
        })}
      </div>

      {isAnswered && (
        <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {selectedOption === currentQuestion.answer ? "✅ Correct!" : "❌ Incorrect"}
          </p>
          <p style={{ fontSize: '0.9rem', color: theme.colors.textMuted, marginBottom: '16px' }}>
            {currentQuestion.explanation}
          </p>
          <Button fullWidth onClick={handleNext}>
            {currentIndex === quizData.quiz.length - 1 ? "Finish Quiz" : "Next Question"}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ActiveQuiz;