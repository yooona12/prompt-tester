import { useState, useEffect } from 'react';
import PromptInput from './components/PromptInput';
import ResultCard from './components/ResultCard';
import AnalysisCard from './components/AnalysisCard';
import HistoryPanel from './components/HistoryPanel';
import { runPrompt, improvePrompt, analyzeResults } from './api/gemini';
import { useHistory } from './hooks/useHistory';
import { useTemplates, CATEGORIES } from './hooks/useTemplates';
import { copyResult, savePDF, shareAsUrl, loadSharedFromUrl } from './utils/export';
import './App.css';

const MODES = {
  COMPARE: 'compare',
  AUTO_IMPROVE: 'auto_improve',
};

export default function App() {
  const [mode, setMode] = useState(MODES.COMPARE);
  const [promptA, setPromptA] = useState('');
  const [promptB, setPromptB] = useState('');
  const [outputA, setOutputA] = useState('');
  const [outputB, setOutputB] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [loadingImprove, setLoadingImprove] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState('');

  const [copied, setCopied] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);
  const [sharedCopied, setSharedCopied] = useState(false);

  // 템플릿 저장 모달
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('기타');

  const { history, addHistory, deleteHistory, clearHistory } = useHistory();
  const { templates, saveTemplate, deleteTemplate } = useTemplates();

  // URL 공유 데이터 로드
  useEffect(() => {
    const shared = loadSharedFromUrl();
    if (shared) {
      setPromptA(shared.promptA ?? '');
      setPromptB(shared.promptB ?? '');
      setOutputA(shared.outputA ?? '');
      setOutputB(shared.outputB ?? '');
      setAnalysis(shared.analysis ?? null);
      setCurrentTimestamp(shared.timestamp ?? null);
    }
  }, []);

  const isRunning = loadingA || loadingB || loadingAnalysis || loadingImprove;
  const canRun = mode === MODES.COMPARE ? promptA.trim() && promptB.trim() : promptA.trim();
  const hasCompleteResults = outputA && outputB && analysis;

  async function handleRun() {
    setError('');
    setOutputA('');
    setOutputB('');
    setAnalysis(null);
    setActiveHistoryId(null);
    setCurrentTimestamp(null);

    let finalPromptB = promptB;

    try {
      if (mode === MODES.AUTO_IMPROVE) {
        setLoadingImprove(true);
        finalPromptB = await improvePrompt(promptA);
        setPromptB(finalPromptB);
        setLoadingImprove(false);
      }

      setLoadingA(true);
      setLoadingB(true);

      const [resA, resB] = await Promise.all([
        runPrompt(promptA).finally(() => setLoadingA(false)),
        runPrompt(finalPromptB).finally(() => setLoadingB(false)),
      ]);

      setOutputA(resA);
      setOutputB(resB);

      setLoadingAnalysis(true);
      const analysisResult = await analyzeResults(promptA, resA, finalPromptB, resB);
      setAnalysis(analysisResult);

      const ts = new Date().toISOString();
      setCurrentTimestamp(ts);

      const newEntry = {
        id: Date.now(),
        timestamp: ts,
        mode,
        promptA,
        promptB: finalPromptB,
        outputA: resA,
        outputB: resB,
        analysis: analysisResult,
      };
      addHistory(newEntry);
      setActiveHistoryId(newEntry.id);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다. API 키를 확인해 주세요.');
    } finally {
      setLoadingA(false);
      setLoadingB(false);
      setLoadingImprove(false);
      setLoadingAnalysis(false);
    }
  }

  function handleRestore(entry) {
    setMode(entry.mode || MODES.COMPARE);
    setPromptA(entry.promptA);
    setPromptB(entry.promptB);
    setOutputA(entry.outputA);
    setOutputB(entry.outputB);
    setAnalysis(entry.analysis);
    setActiveHistoryId(entry.id);
    setCurrentTimestamp(entry.timestamp);
    setError('');
  }

  function handleReset() {
    setPromptA('');
    setPromptB('');
    setOutputA('');
    setOutputB('');
    setAnalysis(null);
    setError('');
    setActiveHistoryId(null);
    setCurrentTimestamp(null);
  }

  function handleModeChange(newMode) {
    setMode(newMode);
    handleReset();
  }

  async function handleCopy() {
    await copyResult({ promptA, outputA, promptB, outputB, analysis, timestamp: currentTimestamp });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSavePdf() {
    setSavingPdf(true);
    savePDF({ promptA, outputA, promptB, outputB, analysis, timestamp: currentTimestamp });
    setTimeout(() => setSavingPdf(false), 1000);
  }

  async function handleShare() {
    await shareAsUrl({ promptA, outputA, promptB, outputB, analysis, timestamp: currentTimestamp });
    setSharedCopied(true);
    setTimeout(() => setSharedCopied(false), 3000);
  }

  function handleLoadTemplate(template) {
    setPromptA(template.promptA);
    setPromptB(template.promptB || '');
    setOutputA('');
    setOutputB('');
    setAnalysis(null);
    setError('');
    setActiveHistoryId(null);
    setCurrentTimestamp(null);
  }

  function handleSaveTemplate(e) {
    e.preventDefault();
    if (!saveName.trim()) return;
    saveTemplate({ name: saveName, category: saveCategory, promptA, promptB });
    setShowSaveModal(false);
    setSaveName('');
    setSaveCategory('기타');
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Prompt Tester</span>
          </div>
          <p className="header-sub">Gemini로 AI 프롬프트를 비교하고 최적화하세요</p>
        </div>
      </header>

      <div className="app-body">
        <HistoryPanel
          history={history}
          onRestore={handleRestore}
          onDelete={deleteHistory}
          onClear={clearHistory}
          activeId={activeHistoryId}
          templates={templates}
          onLoadTemplate={handleLoadTemplate}
          onDeleteTemplate={deleteTemplate}
        />

        <main className="main">
          <div className="mode-tabs">
            <button
              className={`mode-tab ${mode === MODES.COMPARE ? 'mode-tab--active' : ''}`}
              onClick={() => handleModeChange(MODES.COMPARE)}
            >
              A/B 비교
            </button>
            <button
              className={`mode-tab ${mode === MODES.AUTO_IMPROVE ? 'mode-tab--active' : ''}`}
              onClick={() => handleModeChange(MODES.AUTO_IMPROVE)}
            >
              ✨ 자동 개선
            </button>
          </div>

          <div className="inputs-section">
            <div className="inputs-grid">
              <PromptInput
                label="프롬프트 A"
                value={promptA}
                onChange={setPromptA}
                placeholder={
                  mode === MODES.COMPARE
                    ? '첫 번째 프롬프트를 입력하세요...'
                    : '프롬프트를 입력하세요 — AI가 개선된 버전을 자동으로 생성합니다...'
                }
              />
              {mode === MODES.COMPARE ? (
                <PromptInput
                  label="프롬프트 B"
                  value={promptB}
                  onChange={setPromptB}
                  placeholder="두 번째 프롬프트를 입력하세요..."
                />
              ) : (
                <PromptInput
                  label="프롬프트 B"
                  value={promptB}
                  onChange={() => {}}
                  placeholder={
                    loadingImprove
                      ? 'AI가 개선된 프롬프트를 생성하고 있습니다...'
                      : '개선된 프롬프트가 여기에 자동으로 표시됩니다...'
                  }
                  badge={loadingImprove ? '⏳ 생성 중...' : promptB ? '✨ AI 개선됨' : null}
                />
              )}
            </div>

            <div className="actions-row">
              {error && <span className="error-msg">⚠ {error}</span>}
              <div className="buttons">
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => { setSaveName(''); setShowSaveModal(true); }}
                  disabled={!promptA.trim() || isRunning}
                  title="현재 프롬프트를 템플릿으로 저장"
                >
                  📌 저장
                </button>
                <button className="btn btn--ghost" onClick={handleReset} disabled={isRunning}>
                  초기화
                </button>
                <button
                  className="btn btn--primary"
                  onClick={handleRun}
                  disabled={!canRun || isRunning}
                >
                  {loadingImprove
                    ? '✨ 프롬프트 개선 중...'
                    : isRunning
                    ? '⏳ 실행 중...'
                    : mode === MODES.AUTO_IMPROVE
                    ? '✨ 개선 후 비교'
                    : '⚡ 비교하기'}
                </button>
              </div>
            </div>
          </div>

          {(outputA || outputB || loadingA || loadingB || loadingAnalysis) && (
            <section className="results-section">
              <h2 className="section-title">결과</h2>
              <div className="results-grid">
                <ResultCard
                  label="프롬프트 A"
                  output={outputA}
                  loading={loadingA}
                  score={analysis?.score_a}
                  isWinner={analysis?.winner === 'A'}
                />
                <ResultCard
                  label="프롬프트 B"
                  output={outputB}
                  loading={loadingB}
                  score={analysis?.score_b}
                  isWinner={analysis?.winner === 'B'}
                />
              </div>

              <AnalysisCard analysis={analysis} loading={loadingAnalysis} />

              {hasCompleteResults && (
                <div className="export-buttons">
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={handleCopy}
                    disabled={copied}
                  >
                    {copied ? '✓ 복사됨!' : '결과 복사'}
                  </button>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={handleSavePdf}
                    disabled={savingPdf}
                  >
                    {savingPdf ? 'PDF 생성 중...' : 'PDF로 저장'}
                  </button>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={handleShare}
                    disabled={sharedCopied}
                  >
                    {sharedCopied ? '✓ 링크 복사됨!' : '🔗 공유하기'}
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">📌 템플릿으로 저장</h3>
            <form onSubmit={handleSaveTemplate}>
              <div className="modal-field">
                <label className="modal-label">이름</label>
                <input
                  className="modal-input"
                  type="text"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="템플릿 이름을 입력하세요"
                  autoFocus
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">카테고리</label>
                <select
                  className="modal-select"
                  value={saveCategory}
                  onChange={e => setSaveCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <p className="modal-note">
                프롬프트 A{promptB.trim() ? ' + B' : ''}가 저장됩니다.
              </p>
              <div className="modal-actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setShowSaveModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={!saveName.trim()}>
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
