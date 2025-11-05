import axios from 'axios';

// Set the base URL for our FastAPI backend
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generate quiz from URL
export const generateQuiz = (url) => {
  return apiClient.post('/generate_quiz', { url });
};

// Get quiz history
export const getHistory = () => {
  return apiClient.get('/history');
};

// Get quiz details by ID
export const getQuizDetails = (id) => {
  return apiClient.get(`/quiz/${id}`);
};

export default {
  generateQuiz,
  getHistory,
  getQuizDetails,
};
