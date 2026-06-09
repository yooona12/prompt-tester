import { useState } from 'react';
import { CATEGORIES } from '../hooks/useTemplates';

function formatDate(ts) {
  return new Date(ts).toLocaleString('ko-KR', {
    month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function WinnerBadge({ winner }) {
  const isWin = winner === 'A' || winner === 'B';
  return (
    <span className={`history-winner ${isWin ? 'history-winner--win' : 'history-winner--tie'}`}>
      {winner === 'A' ? 'A 승' : winner === 'B' ? 'B 승' : '무승부'}
    </span>
  );
}

function HistoryTab({ history, onRestore, onDelete, onClear, activeId }) {
  return (
    <>
      <div className="history-header">
        <span className="history-title">히스토리 ({history.length})</span>
        <div className="history-header-actions">
          {history.length > 0 && (
            <button className="history-btn-clear" onClick={onClear}>전체 삭제</button>
          )}
        </div>
      </div>
      <div className="history-list">
        {history.length === 0 ? (
          <p className="history-empty">아직 테스트 기록이 없습니다</p>
        ) : (
          history.map(entry => (
            <div
              key={entry.id}
              className={`history-item ${activeId === entry.id ? 'history-item--active' : ''}`}
              onClick={() => onRestore(entry)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onRestore(entry)}
            >
              <div className="history-item-top">
                <span className="history-date">{formatDate(entry.timestamp)}</span>
                <button
                  className="history-delete"
                  onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
                  title="삭제"
                >✕</button>
              </div>
              <div className="history-item-meta">
                <WinnerBadge winner={entry.analysis?.winner} />
                <span className="history-scores">
                  A:{entry.analysis?.score_a} · B:{entry.analysis?.score_b}
                </span>
              </div>
              <p className="history-preview">{entry.promptA}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function TemplatesTab({ templates, onLoad, onDelete }) {
  const [filter, setFilter] = useState('전체');
  const filtered = filter === '전체' ? templates : templates.filter(t => t.category === filter);

  return (
    <>
      <div className="history-header">
        <span className="history-title">템플릿 ({templates.length})</span>
      </div>
      <div className="template-filter">
        {['전체', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            className={`template-filter-btn ${filter === cat ? 'template-filter-btn--active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="history-list">
        {filtered.length === 0 ? (
          <p className="history-empty">
            {templates.length === 0 ? '저장된 템플릿이 없습니다' : '해당 카테고리 템플릿 없음'}
          </p>
        ) : (
          filtered.map(t => (
            <div
              key={t.id}
              className="history-item"
              onClick={() => onLoad(t)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onLoad(t)}
            >
              <div className="history-item-top">
                <span className="template-category-badge">{t.category}</span>
                <button
                  className="history-delete"
                  onClick={e => { e.stopPropagation(); onDelete(t.id); }}
                  title="삭제"
                >✕</button>
              </div>
              <p className="template-name">{t.name}</p>
              <p className="history-preview">{t.promptA}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default function HistoryPanel({
  history, onRestore, onDelete, onClear, activeId,
  templates, onLoadTemplate, onDeleteTemplate,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState('history');

  return (
    <aside className={`history-panel ${collapsed ? 'history-panel--collapsed' : ''}`}>
      {collapsed ? (
        <div className="history-header" style={{ justifyContent: 'center' }}>
          <button
            className="history-toggle"
            onClick={() => setCollapsed(false)}
            title="패널 열기"
          >▶</button>
        </div>
      ) : (
        <>
          <div className="side-tab-bar">
            <button
              className={`side-tab ${tab === 'history' ? 'side-tab--active' : ''}`}
              onClick={() => setTab('history')}
            >히스토리</button>
            <button
              className={`side-tab ${tab === 'templates' ? 'side-tab--active' : ''}`}
              onClick={() => setTab('templates')}
            >템플릿</button>
            <button
              className="history-toggle"
              style={{ marginLeft: 'auto', flexShrink: 0 }}
              onClick={() => setCollapsed(true)}
              title="패널 닫기"
            >◀</button>
          </div>

          {tab === 'history' ? (
            <HistoryTab
              history={history}
              onRestore={onRestore}
              onDelete={onDelete}
              onClear={onClear}
              activeId={activeId}
            />
          ) : (
            <TemplatesTab
              templates={templates}
              onLoad={onLoadTemplate}
              onDelete={onDeleteTemplate}
            />
          )}
        </>
      )}
    </aside>
  );
}
