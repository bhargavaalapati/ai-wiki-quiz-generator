import React, { useState } from 'react';
import { getQuizDetails } from '../services/api'; 
import Modal from '../components/Modal';
import QuizDisplay from '../components/QuizDisplay';


const HistoryTab = ({ history, loading }) => {

  // --- Modal states are still local to this component ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [modalError, setModalError] = useState(null);


  const handleDetailsClick = async (quizId) => {
    setModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setSelectedQuiz(null);
    try {
      const response = await getQuizDetails(quizId);
      setSelectedQuiz(response.data);
    } catch { // --- FIX: Added err object ---
      setModalError('Failed to fetch quiz details.'); 
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <p>Loading history...</p>;

  return (
    <>
      <h2 className="h4 mb-4">Quiz Generation History</h2>

      {modalError && <p className="text-danger">{modalError}</p>}
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Article Title</th>
              <th>URL</th>
              <th>Date</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            
            {history.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td className="fw-medium">{item.title}</td>
                <td className="text-truncate" style={{ maxWidth: '300px' }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                </td>
                <td>{new Date(item.date_generated).toLocaleString()}</td>
                <td className="text-end">
                  <button
                    onClick={() => handleDetailsClick(item.id)}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        show={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={selectedQuiz?.title || 'Loading Quiz...'}
      >
        {modalLoading && (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        {selectedQuiz && <QuizDisplay data={selectedQuiz} />}
      </Modal>
    </>
  );
};

export default HistoryTab;