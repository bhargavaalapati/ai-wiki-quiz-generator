import React from "react";
import styled from "@emotion/styled";
import { Card, Badge } from "./StyledUI";
import { theme } from "../theme";

const SectionTitle = styled.h4`
  margin-top: 24px;
  margin-bottom: 16px;
  color: ${theme.colors.primary};
  border-bottom: 2px solid ${theme.colors.border};
  padding-bottom: 8px;
`;

const QuestionBlock = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: ${theme.colors.background};
  border-radius: 8px;
`;

const OptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 16px 0;
  
  li {
    padding: 8px 12px;
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.border};
    margin-bottom: 8px;
    border-radius: 6px;
  }
`;

const AnswerBox = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #ecfdf5;
  border: 1px solid ${theme.colors.success};
  border-radius: 6px;
  color: #065f46;
  font-size: 0.9rem;
`;

const QuizDisplay = ({ data }) => {
  if (!data) return null;

  return (
    <div>
      {/* Summary Card */}
      <Card>
        <h2 style={{ marginTop: 0 }}>{data.title}</h2>
        <p style={{ lineHeight: '1.6', color: theme.colors.text }}>{data.summary}</p>
        
        {/* --- Animated Topics Badges --- */}
        {data.related_topics && (
          <div style={{ marginTop: "16px" }}>
            <strong>Topics: </strong>
            {data.related_topics.map((t, i) => (
              <Badge key={i} style={{ "--i": i }}>
                {t}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Quiz Questions */}
      <Card>
        <SectionTitle>Generated Quiz</SectionTitle>
        
        {/* --- FIX: Add safety check for quiz array --- */}
        {data.quiz && data.quiz.map((q, index) => (
          <QuestionBlock key={index}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Q{index + 1}. {q.question}</strong>
              <Badge>{q.difficulty}</Badge>
            </div>

            <OptionList>
              {q.options.map((opt, i) => (
                <li key={i}><strong>{String.fromCharCode(65 + i)}.</strong> {opt}</li>
              ))}
            </OptionList>

            <AnswerBox>
              <strong>Correct Answer:</strong> {q.answer}
              <br />
              <span style={{ opacity: 0.8 }}>{q.explanation}</span>
            </AnswerBox>
          </QuestionBlock>
        ))}
      </Card>
    </div>
  );
};

export default QuizDisplay;