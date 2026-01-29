// src/components/RateLimitCard.jsx
import React from 'react';
import styled from '@emotion/styled';
import { Card, Button } from './StyledUI';
import { theme } from '../theme';

const LimitContainer = styled(Card)`
  background: #fff1f2; /* Light Red/Pink */
  border: 2px solid ${theme.colors.danger};
  text-align: center;
  padding: 40px;
  animation: shake 0.5s;

  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }
`;

const Icon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  color: ${theme.colors.danger};
  margin-bottom: 8px;
`;

const RateLimitCard = ({ message, onRetry }) => {
  return (
    <LimitContainer>
      <Icon>🛑</Icon>
      <Title>Whoa, Slow Down!</Title>
      <p style={{ color: theme.colors.text, fontSize: '1.1rem' }}>
        {message || "You have reached the hourly limit for the Free Tier."}
      </p>
      
      <div style={{ margin: '20px 0', padding: '15px', background: 'white', borderRadius: '8px' }}>
        <strong>Quota:</strong> 2 Quizzes / Hour
        <br />
        <small style={{ color: theme.colors.textMuted }}>
          This helps us keep the service free for everyone.
        </small>
      </div>

      <Button onClick={onRetry} style={{ background: theme.colors.secondary }}>
        Check Again
      </Button>
    </LimitContainer>
  );
};

export default RateLimitCard;