import { useState } from "react";
import { generateQuiz } from "../api/api";
import { Loader } from "../components/Loader";
import { SkeletonCard } from "../components/SkeletonCard";

const GenerateTab = ({ setBackgroundTask }) => {
  const [url, setUrl] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setBackgroundTask(true);

    try {
      const res = await generateQuiz(url);
      setQuiz(res.data);
    } catch {
      alert("Quiz generation failed");
    } finally {
      setLoading(false);
      setBackgroundTask(false);
    }
  };

  return (
    <div className="card p-4 shadow">
      <input
        className="form-control mb-3"
        placeholder="Paste Wikipedia URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Quiz"}
      </button>

      {loading && (
        <>
          <Loader text="Scraping Wikipedia → AI Processing → Creating Quiz..." />
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </>
      )}

      {quiz && (
        <div className="mt-4">
          <h5 className="text-success">📘 {quiz.title}</h5>

          {quiz.quiz.map((q, i) => (
            <div key={i} className="card mb-3 border-primary">
              <div className="card-body">
                <strong>Q{i + 1}. {q.question}</strong>
                <ul>
                  {q.options.map((op, idx) => (
                    <li key={idx}>{op}</li>
                  ))}
                </ul>
                <p className="text-success">✔ {q.answer}</p>
                <small className="text-muted">
                  {q.difficulty} • {q.explanation}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateTab;
