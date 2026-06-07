import { useState } from 'react';

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

export default function HistoryPanel({ history, onRestore, onDelete, onClear, activeId }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`history-panel ${collapsed ? 'history-panel--collapsed' : ''}`}>
      <div className="history-header">
        {!collapsed && (
          <span className="history-title">히스토리 ({history.length})</span>
        )}
        <div className="history-header-actions">
          {!collapsed && history.length > 0 && (
            <button className="history-btn-clear" onClick={onClear}>
              전체 삭제
            </button>
          )}
          <button
            className="history-toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? '히스토리 열기' : '히스토리 닫기'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>

      {!collapsed && (
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
                  >
                    ✕
                  </button>
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
      )}
    </aside>
  );
}
