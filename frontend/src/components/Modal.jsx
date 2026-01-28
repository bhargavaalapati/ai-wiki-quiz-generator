import React from "react";
import styled from "@emotion/styled";
import { theme } from "../theme";
import { Button } from "./StyledUI";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${theme.colors.surface};
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: ${theme.radius};
  box-shadow: ${theme.shadows.modal};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 { margin: 0; font-size: 1.25rem; }
`;

const Body = styled.div`
  padding: 20px;
  overflow-y: auto;
`;

const Footer = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${theme.colors.border};
  text-align: right;
  background: ${theme.colors.background};
`;

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <h3>{title}</h3>
          <Button onClick={onClose} style={{ padding: '8px 12px', background: 'transparent', color: '#666' }}>✕</Button>
        </Header>
        <Body>{children}</Body>
        <Footer>
          <Button onClick={onClose}>Close</Button>
        </Footer>
      </ModalContent>
    </Overlay>
  );
};

export default Modal;