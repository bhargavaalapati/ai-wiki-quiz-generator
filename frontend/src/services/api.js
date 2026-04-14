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

//Get recommendations for a failed topic
export const getRecommendations = async (failedTopic, summaryOfFailedTopic) => {
  try {
    const response = await axios.post(`${baseURL}/recommend_path`, {
      failed_topic: failedTopic,
      summary_of_failed_topic: summaryOfFailedTopic,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
};

export default {
  generateQuiz,
  getHistory,
  getQuizDetails,
  getRecommendations
};
