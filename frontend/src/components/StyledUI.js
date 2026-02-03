import styled from '@emotion/styled';
import { theme } from '../theme';

export const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${theme.colors.text};
`;

export const Card = styled.div`
  position: relative;
  background: ${theme.colors.surface};
  border-radius: ${theme.radius};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.card};
  padding: 26px;
  margin-bottom: 20px;
  transition: transform 0.2s ease;
`;

export const Button = styled.button`
  background: ${(props) => props.variant === 'outline' ? 'transparent' : theme.colors.primary};
  color: ${(props) => props.variant === 'outline' ? theme.colors.primary : '#fff'};
  border: ${(props) => props.variant === 'outline' ? `2px solid ${theme.colors.primary}` : 'none'};
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: ${(props) => props.fullWidth ? '100%' : 'auto'};
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  margin-bottom: 16px;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

export const Badge = styled.span`
  background: ${theme.colors.background};
  color: ${theme.colors.textMuted};
  border: 1px solid ${theme.colors.border};
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
  text-transform: uppercase;
  display: inline-block;

  /* Animation */
  opacity: 0;
  transform: translateY(10px);
  animation: badgeFadeIn 0.8s ease forwards;
  animation-delay: calc(var(--i) * 0.3s);

  @keyframes badgeFadeIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;


export const StatusAlert = styled.div`
  background: ${props => props.variant === 'info' ? '#e0f2fe' : '#fee2e2'};
  color: ${props => props.variant === 'info' ? '#0369a1' : '#b91c1c'};
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  border: 1px solid ${props => props.variant === 'info' ? '#bae6fd' : '#fecaca'};
`;

export const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.colors.textMuted};
  
  h3 { color: ${theme.colors.text}; margin-bottom: 8px; }
`;