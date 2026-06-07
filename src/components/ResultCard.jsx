export default function ResultCard({ label, output, loading, score, isWinner }) {
  return (
    <div className={`result-card ${isWinner ? 'result-card--winner' : ''}`}>
      <div className="result-header">
        <span className="result-label">{label}</span>
        {isWinner && <span className="winner-badge">우승</span>}
        {score != null && (
          <span className="score-badge">
            <span className="score-icon">★</span> {score}/10
          </span>
        )}
      </div>
      <div className="result-body">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>응답 생성 중...</span>
          </div>
        ) : output ? (
          <pre className="result-text">{output}</pre>
        ) : (
          <span className="result-placeholder">결과가 여기에 표시됩니다</span>
        )}
      </div>
    </div>
  );
}
