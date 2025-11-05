import { useState, useEffect } from 'react';
import GenerateQuizTab from './tabs/GenerateQuizTab';
import HistoryTab from './tabs/HistoryTab'
import { getHistory } from './services/api';;

function App() {
  const [activeTab, setActiveTab] = useState('generate');

  // --- STATE LIFTED UP ---
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await getHistory();
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };
  
  // Fetch history when the App first loads
  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      <header className="bg-primary text-white p-4 shadow-sm">
        <h1 className="h3">AI Wiki Quiz Generator</h1>
      </header>

      <div className="container-fluid mt-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'generate' ? 'active' : ''}`}
              onClick={() => setActiveTab('generate')}
            >
              Generate Quiz
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Past Quizzes (History)
            </button>
          </li>
        </ul>

        <main className="p-4 bg-white border border-top-0 rounded-bottom">
          <div className={activeTab === 'generate' ? 'd-block' : 'd-none'}>
            <GenerateQuizTab onQuizGenerated={fetchHistory} />
          </div>
          <div className={activeTab === 'history' ? 'd-block' : 'd-none'}>
            <HistoryTab 
              history={history} 
              loading={historyLoading} 
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;