import React, { useState } from "react";
import styled from "@emotion/styled";
import { theme } from "../theme";
import { Card, Button, Input, StatusAlert } from "../components/StyledUI";
import { isValidWikiUrl } from "../utils/validation";
import QuizDisplay from "../components/QuizDisplay";
import ActiveQuiz from "../components/ActiveQuiz";

const HelperText = styled.p`
  font-size: 0.85rem;
  color: ${(props) =>
    props.isError ? theme.colors.danger : theme.colors.textMuted};
  margin-top: -8px;
  margin-bottom: 16px;
  transition: color 0.2s;
`;

const Spinner = styled.div`
  border: 3px solid ${theme.colors.background};
  border-top: 3px solid ${theme.colors.primary};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const GenerateQuizTab = ({ onStart, isGenerating, lastGeneratedQuiz }) => {
  const [url, setUrl] = useState("");
  const [inputError, setInputError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    if (inputError) setInputError("");
  };

  const handleGenerateClick = () => {
    if (!url) {
      setInputError("URL is required.");
      return;
    }

    if (!isValidWikiUrl(url)) {
      setInputError(
        "Please enter a valid Wikipedia article URL (e.g., https://en.wikipedia.org/wiki/AI)."
      );
      return;
    }

    onStart(url);
    setUrl("");
  };

  return (
    <>
      <Card>
        <h4 style={{ marginBottom: "16px" }}>🔗 Generate New Quiz</h4>

        <Input
          value={url}
          onChange={handleUrlChange}
          placeholder="Paste Wikipedia URL here..."
          disabled={isGenerating}
          style={{
            borderColor: inputError ? theme.colors.danger : theme.colors.border,
          }}
        />

        {inputError && <HelperText isError>{inputError}</HelperText>}
        {!inputError && (
          <HelperText>Strictly supports Wikipedia article links.</HelperText>
        )}

        <Button
          fullWidth
          onClick={handleGenerateClick}
          disabled={isGenerating}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          {isGenerating ? (
            <>
              <Spinner /> Generating Quiz...
            </>
          ) : (
            "Start Quiz Generation"
          )}
        </Button>
      </Card>

      {/* Show the last quiz generated in this session if it exists */}
      {lastGeneratedQuiz && (
        <div style={{ marginTop: "32px" }}>
          <StatusAlert variant="info">
            ✨ New Quiz Generated Successfully!
          </StatusAlert>

          {/* TOGGLE: Show Active Quiz OR Static Display */}
          {isPlaying ? (
            <ActiveQuiz
              quizData={lastGeneratedQuiz}
              onExit={() => setIsPlaying(false)}
            />
          ) : (
            <>
              <Button
                fullWidth
                onClick={() => setIsPlaying(true)}
                style={{
                  marginBottom: "20px",
                  background: theme.colors.success,
                }}
              >
                ▶️ Play Interactive Quiz
              </Button>
              <QuizDisplay data={lastGeneratedQuiz} />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default GenerateQuizTab;
