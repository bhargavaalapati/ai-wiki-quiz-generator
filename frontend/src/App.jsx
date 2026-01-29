// src/App.jsx
import { useState, useCallback, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { generateQuiz, getHistory } from "./services/api";
import GenerateTab from "./tabs/GenerateQuizTab";
import HistoryTab from "./tabs/HistoryTab";
import RateLimitCard from "./components/RateLimitCard";   // NEW
import { Container, StatusAlert } from "./components/StyledUI";
import { theme } from "./theme";

const Title = styled.h2`
  text-align: center;
  color: ${theme.colors.primary};
  margin-bottom: 32px;
  font-size: 2rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: ${(props) =>
    props.isActive ? theme.colors.primary : theme.colors.textMuted};
  border-bottom: ${(props) =>
    props.isActive
      ? `3px solid ${theme.colors.primary}`
      : "3px solid transparent"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const App = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [isGenerating, setIsGenerating] = useState(false);

  // Data State
  const [history, setHistory] = useState([]);
  const [lastGeneratedQuiz, setLastGeneratedQuiz] = useState(null);

  // Rate limit error state (NEW)
  const [rateLimitError, setRateLimitError] = useState(null);

  // --- CACHE LOCK ---
  const dataFetchedRef = useRef(false);

  // 1. Fetch History ONCE on mount
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    const initHistory = async () => {
      try {
        const res = await getHistory();
        setHistory(res.data);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    initHistory();
  }, []);

  // 2. Generator Function (with 429 handling)
  const startGeneration = useCallback(async (url) => {
    setIsGenerating(true);
    setLastGeneratedQuiz(null);
    setRateLimitError(null); // reset rate-limit error before request

    try {
      const res = await generateQuiz(url);

      if (res.status === 200) {
        const newQuiz = res.data;
        setLastGeneratedQuiz(newQuiz);

        // Optimistic History Update
        const newHistoryItem = {
          id: newQuiz.id,
          title: newQuiz.title,
          url: url,
          date_generated: new Date().toISOString(),
        };

        setHistory((prevHistory) => [newHistoryItem, ...prevHistory]);
      }
    } catch (err) {
      // --- CATCH 429 ERROR ---
      if (err.response && err.response.status === 429) {
        setRateLimitError(err.response.data.detail);
      } else {
        console.error("Generation failed:", err);
        alert("Generation failed.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return (
    <Container>
      <Title>🧠 Wiki Quiz Generator</Title>

      {/* --- SHOW RATE LIMIT CARD IF BLOCKED --- */}
      {rateLimitError ? (
        <RateLimitCard
          message={rateLimitError}
          onRetry={() => setRateLimitError(null)}
        />
      ) : (
        <>
          {isGenerating && (
            <StatusAlert variant="info">
              ⏳ Quiz generation is running in the background. You can browse
              history while you wait!
            </StatusAlert>
          )}

          <TabList>
            <TabButton
              isActive={activeTab === "generate"}
              onClick={() => setActiveTab("generate")}
            >
              Generate Quiz
            </TabButton>
            <TabButton
              isActive={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            >
              History
            </TabButton>
          </TabList>

          {activeTab === "generate" && (
            <GenerateTab
              onStart={startGeneration}
              isGenerating={isGenerating}
              lastGeneratedQuiz={lastGeneratedQuiz}
            />
          )}

          {activeTab === "history" && (
            <HistoryTab history={history} />
          )}
        </>
      )}
    </Container>
  );
};

export default App;
