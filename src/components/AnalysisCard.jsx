export default function AnalysisCard({ analysis, loading }) {
  if (!loading && !analysis) return null;

  return (
    <div className="analysis-card">
      <div className="analysis-header">
        <span className="analysis-icon">AI</span>
        <span className="analysis-title">AI 분석</span>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>결과 분석 중...</span>
        </div>
      ) : (
        <div className="analysis-body">
          <p className="analysis-summary">{analysis.summary}</p>

          <div className="analysis-grid">
            <PromptDetail
              label="프롬프트 A"
              score={analysis.score_a}
              strengths={analysis.strengths_a}
              weaknesses={analysis.weaknesses_a}
              isWinner={analysis.winner === 'A'}
            />
            <PromptDetail
              label="프롬프트 B"
              score={analysis.score_b}
              strengths={analysis.strengths_b}
              weaknesses={analysis.weaknesses_b}
              isWinner={analysis.winner === 'B'}
            />
          </div>

          <div className="analysis-recommendation">
            <span className="rec-label">추천</span>
            <p>{analysis.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PromptDetail({ label, score, strengths, weaknesses, isWinner }) {
  return (
    <div className={`prompt-detail ${isWinner ? 'prompt-detail--winner' : ''}`}>
      <div className="detail-header">
        <span>{label}</span>
        <span className="detail-score">★ {score}/10</span>
      </div>
      {strengths?.length > 0 && (
        <ul className="detail-list detail-list--strengths">
          {strengths.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
      {weaknesses?.length > 0 && (
        <ul className="detail-list detail-list--weaknesses">
          {weaknesses.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      )}
    </div>
  );
}
