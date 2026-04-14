import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Card, Button } from './StyledUI';
import { theme } from '../theme';
import { getRecommendations } from '../services/api';

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  color: ${theme.colors.textMuted};
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 2px 4px;
  line-height: 1;
  border-radius: 4px;
  z-index: 10;

  &:hover {
    color: ${theme.colors.danger};
    background: rgba(220, 38, 38, 0.1);
    transform: scale(1.05);
  }
`;

const QuestionText = styled.h3`
  color: ${theme.colors.primary};
  margin-bottom: 24px;
  padding-right: 20px;
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
  padding: 20px;
  
  h2 { font-size: 3rem; color: ${theme.colors.primary}; margin: 0; }
  p { font-size: 1.2rem; color: ${theme.colors.textMuted}; }
`;

const ActiveQuiz = ({ quizData, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // State for RAG recommendations
  const [recommendations, setRecommendations] = useState(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Calculate score percentage dynamically
  const totalQuestions = quizData?.quiz?.length || 0;
  const scorePercentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Fetch recommendations ONLY when quiz finishes AND score is low
  useEffect(() => {
    if (showScore && scorePercentage < 60 && quizData?.title) {
      const fetchRecs = async () => {
        setIsLoadingRecs(true);
        try {
          const data = await getRecommendations(
            quizData.title, 
            `The user scored ${scorePercentage}% on the quiz.`
          );
          setRecommendations(data.recommended_topics);
        } catch {
          console.error("Failed to load recommendations");
        } finally {
          setIsLoadingRecs(false);
        }
      };
      fetchRecs();
    }
  }, [showScore, scorePercentage, quizData?.title]);


  if (!quizData || !quizData.quiz || quizData.quiz.length === 0) {
      return <Card>Error loading quiz data.</Card>;
  }

  const currentQuestion = quizData.quiz[currentIndex];

  const handleOptionClick = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < totalQuestions) {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowScore(true); // This triggers the useEffect for RAG!
    }
  };

  const getOptionStyle = (option) => {
    if (!isAnswered) return { borderColor: theme.colors.border, bgColor: theme.colors.surface };

    if (option === currentQuestion.answer) {
      return { borderColor: theme.colors.success, bgColor: '#ecfdf5' }; 
    }
    if (option === selectedOption && option !== currentQuestion.answer) {
      return { borderColor: theme.colors.danger, bgColor: '#fef2f2' }; 
    }
    return { borderColor: theme.colors.border, bgColor: theme.colors.surface };
  };

  // --- FINAL SCOREBOARD & RAG UI ---
  if (showScore) {
    return (
      <Card style={{ position: 'relative' }}>
        <CloseButton onClick={onExit} title="Exit Quiz">✕</CloseButton>
        
        <ScoreBoard>
          <p>Quiz Completed!</p>
          <h2>{score} / {totalQuestions}</h2>
          <p style={{ marginTop: '10px', marginBottom: '30px', fontWeight: 'bold' }}>
            {scorePercentage}% Accuracy
          </p>

          {/* --- HYBRID RAG RECOMMENDATION UI --- */}
          {scorePercentage < 60 && (
            <div style={{ 
                marginTop: '20px', 
                marginBottom: '30px',
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px', 
                borderLeft: `4px solid ${theme.colors.primary}`,
                textAlign: 'left'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>📚 Adaptive Learning Path</h3>
              <p style={{ fontSize: '0.95rem', marginBottom: '15px' }}>
                It looks like you struggled a bit. We analyzed our Knowledge Base to find the best prerequisite topics for you to study before trying again:
              </p>
              
              {isLoadingRecs ? (
                <p style={{ fontStyle: 'italic', color: theme.colors.primary }}>🤖 AI is generating your personalized learning path...</p>
              ) : recommendations && recommendations.length > 0 ? (
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {recommendations.map((topic, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                       <a 
                          href={`https://en.wikipedia.org/wiki/${topic.replace(/ /g, '_')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: theme.colors.primary, fontWeight: 'bold', textDecoration: 'none' }}
                        >
                          {topic} ↗
                       </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: theme.colors.textMuted }}>Could not load recommendations at this time.</p>
              )}
            </div>
          )}

          <Button fullWidth onClick={onExit}>
            Review Answers & Exit
          </Button>
        </ScoreBoard>
      </Card>
    );
  }

  // --- ACTIVE QUIZ VIEW ---
  return (
    <Card style={{ position: 'relative' }}> 
      <CloseButton onClick={onExit} title="Exit Quiz">✕</CloseButton>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', marginTop: '10px' }}>
        <span style={{ fontWeight: 'bold', color: theme.colors.textMuted }}>
          Question {currentIndex + 1} of {totalQuestions}
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
            {currentIndex === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ActiveQuiz;