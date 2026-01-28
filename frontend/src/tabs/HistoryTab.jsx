import { useState } from "react";
import { getQuizDetails } from "../services/api";
import { Card, Button, EmptyStateContainer } from "../components/StyledUI";
import Modal from "../components/Modal";
import QuizDisplay from "../components/QuizDisplay";
import { theme } from "../theme";

const HistoryTab = ({ history }) => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const handleViewDetails = async (id) => {
    try {
      const res = await getQuizDetails(id);
      setSelectedQuiz(res.data);
    } catch (err) {
      alert("Could not load details.",err);
    }
  };

  if (!history || history.length === 0) {
    return (
      <EmptyStateContainer>
        <h3>📭 History is Empty</h3>
        <p>No quizzes found yet.</p>
      </EmptyStateContainer>
    );
  }

  return (
    <div>
      {history.map((item) => (
        <Card key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ overflow: 'hidden', marginRight: '1rem' }}>
            <h4 style={{ margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.title}
            </h4>
            <small style={{ color: theme.colors.textMuted }}>{item.url}</small>
          </div>
          
          <Button variant="outline" onClick={() => handleViewDetails(item.id)}>
            Details
          </Button>
        </Card>
      ))}

      <Modal show={!!selectedQuiz} onClose={() => setSelectedQuiz(null)} title={selectedQuiz?.title}>
        {selectedQuiz && <QuizDisplay data={selectedQuiz} />}
      </Modal>
    </div>
  );
};

export default HistoryTab;