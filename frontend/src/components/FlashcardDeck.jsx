// frontend/src/components/FlashcardDeck.jsx
import React, { useState } from "react";

// ========== STYLES (preserves your originals) ==========
const cardWrapper = {
  perspective: "1200px",
  width: "300px",
  height: "200px",
  cursor: "pointer",
  borderRadius: "16px",
  transition: "all 0.4s ease",
};

const cardContainer = (isHovered) => ({
  width: "100%",
  height: "100%",
  borderRadius: "16px",
  transform: isHovered ? "scale(1.05) rotateY(6deg) rotateX(3deg)" : "scale(1)",
  boxShadow: isHovered
    ? "0 14px 36px rgba(13, 110, 253, 0.35)"
    : "0 8px 24px rgba(0, 0, 0, 0.15)",
  transition: "transform 0.35s ease, box-shadow 0.35s ease",
  background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
  overflow: "hidden",
});

const cardInner = (isFlipped) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  textAlign: "center",
  transition: "transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1)",
  transformStyle: "preserve-3d",
  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
});

const cardFace = {
  position: "absolute",
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  borderRadius: "16px",
  fontFamily: "'Poppins', sans-serif",
  fontSize: "1.1rem",
  fontWeight: "500",
};

const cardFront = {
  ...cardFace,
  backgroundColor: "#f8f9fa",
  border: "1px solid #dee2e6",
  color: "#212529",
  boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)",
};

const cardBack = {
  ...cardFace,
  background: "linear-gradient(135deg, #0d6efd, #007bff)",
  border: "1px solid #0a58ca",
  color: "white",
  transform: "rotateY(180deg)",
  boxShadow: "0 4px 20px rgba(13,110,253,0.4)",
};

// ========== CARD ==========
const Flashcard = ({ card, isActive, onFlip, globalFlipped }) => {
  const [isHovered, setIsHovered] = useState(false);
  const dimmed = globalFlipped && !isActive;

  return (
    <div
      style={{
        ...cardWrapper,
        filter: dimmed ? "blur(1.5px) brightness(0.75)" : "none",
        opacity: dimmed ? 0.6 : 1,
      }}
    >
      <div
        style={cardContainer(isHovered && !isActive)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onFlip}
      >
        <div style={cardInner(isActive)}>
          <div style={cardFront}>
            <h5>{card.term}</h5>
          </div>
          <div style={cardBack}>
            <p>{card.definition}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== DECK ==========
const FlashcardDeck = ({ cards }) => {
  const [activeCard, setActiveCard] = useState(null);

  const handleFlip = (term) => {
    setActiveCard((prev) => (prev === term ? null : term));
  };

  return (
    <div className="mt-5 text-center">
      <h3 className="h3 mb-3 fw-bold">✨ Key Concept Flashcards ✨</h3>
      <p className="text-muted mb-4">
        Click to flip. Only one flips at a time.
      </p>

      <div
        className="d-flex flex-wrap gap-4 justify-content-center"
        style={{ perspective: "1600px" }}
      >
        {cards.map((card, i) => (
          <Flashcard
            key={i}
            card={card}
            isActive={activeCard === card.term}
            globalFlipped={!!activeCard}
            onFlip={() => handleFlip(card.term)}
          />
        ))}
      </div>
    </div>
  );
};

export default FlashcardDeck;
