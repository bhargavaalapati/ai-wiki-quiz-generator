import axios from 'axios';


const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Set the base URL for our FastAPI backend
const apiClient = axios.create({
  baseURL: baseURL,
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
