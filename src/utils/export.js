function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function copyResult({ promptA, outputA, promptB, outputB, analysis, timestamp }) {
  const date = new Date(timestamp).toLocaleString('ko-KR');
  const winner =
    analysis.winner === 'A' ? '프롬프트 A' :
    analysis.winner === 'B' ? '프롬프트 B' : '무승부';

  const text = [
    '══ 프롬프트 테스터 결과 ══',
    `날짜: ${date}`,
    `승자: ${winner}  (A: ${analysis.score_a}/10점 · B: ${analysis.score_b}/10점)`,
    '',
    '【 프롬프트 A 】',
    promptA,
    '',
    '【 출력 A 】',
    outputA,
    '',
    '【 프롬프트 B 】',
    promptB,
    '',
    '【 출력 B 】',
    outputB,
    '',
    '【 AI 분석 】',
    analysis.summary,
    '',
    analysis.recommendation,
  ].join('\n');

  return navigator.clipboard.writeText(text);
}

export function savePDF({ promptA, outputA, promptB, outputB, analysis, timestamp }) {
  const date = new Date(timestamp).toLocaleString('ko-KR');
  const winner =
    analysis.winner === 'A' ? '프롬프트 A 승리' :
    analysis.winner === 'B' ? '프롬프트 B 승리' : '무승부';

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>프롬프트 테스터 결과 - ${date}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
      font-size: 14px; line-height: 1.65; color: #1a1a2e; padding: 48px;
    }
    .page-header { border-bottom: 2px solid #5c6bc0; padding-bottom: 16px; margin-bottom: 28px; }
    .page-title { font-size: 22px; font-weight: 700; color: #1a1d27; margin-bottom: 4px; }
    .page-meta { font-size: 13px; color: #666; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .card { border: 1px solid #dde; border-radius: 8px; padding: 14px 16px; background: #fafbff; }
    .card.winner { border-color: #4caf82; background: #f0faf6; }
    .card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #666; margin-bottom: 8px; }
    pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: 13px; color: #222; }
    .section { background: #f5f6ff; border: 1px solid #dde; border-radius: 8px; padding: 20px; }
    .section-title { font-size: 14px; font-weight: 700; color: #5c6bc0; margin-bottom: 12px; }
    .summary { font-weight: 600; font-size: 14px; margin-bottom: 16px; padding: 12px 14px; background: #fff; border-radius: 6px; border-left: 3px solid #5c6bc0; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .detail-label { font-size: 11px; font-weight: 600; color: #555; margin-bottom: 5px; margin-top: 10px; }
    .detail-label:first-child { margin-top: 0; }
    ul { list-style: none; padding: 0; }
    li { font-size: 12px; padding-left: 14px; position: relative; margin-bottom: 2px; }
    li.s::before { content: '+'; position: absolute; left: 0; color: #4caf82; font-weight: 700; }
    li.w::before { content: '−'; position: absolute; left: 0; color: #ef5350; font-weight: 700; }
    .recommendation { border-top: 1px solid #dde; padding-top: 14px; }
    .rec-label { font-size: 11px; font-weight: 600; color: #555; margin-bottom: 6px; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="page-header">
    <div class="page-title">⚡ 프롬프트 테스터 결과</div>
    <div class="page-meta">${date} &nbsp;·&nbsp; ${winner}</div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">프롬프트 A &nbsp;·&nbsp; ${analysis.score_a}/10점</div>
      <pre>${escapeHtml(promptA)}</pre>
    </div>
    <div class="card">
      <div class="card-label">프롬프트 B &nbsp;·&nbsp; ${analysis.score_b}/10점</div>
      <pre>${escapeHtml(promptB)}</pre>
    </div>
  </div>

  <div class="grid">
    <div class="card${analysis.winner === 'A' ? ' winner' : ''}">
      <div class="card-label">출력 A${analysis.winner === 'A' ? ' &nbsp;· 🏆 우승' : ''}</div>
      <pre>${escapeHtml(outputA)}</pre>
    </div>
    <div class="card${analysis.winner === 'B' ? ' winner' : ''}">
      <div class="card-label">출력 B${analysis.winner === 'B' ? ' &nbsp;· 🏆 우승' : ''}</div>
      <pre>${escapeHtml(outputB)}</pre>
    </div>
  </div>

  <div class="section">
    <div class="section-title">AI 분석</div>
    <div class="summary">${escapeHtml(analysis.summary)}</div>
    <div class="detail-grid">
      <div>
        <div class="detail-label">프롬프트 A 강점</div>
        <ul>${(analysis.strengths_a || []).map(s => `<li class="s">${escapeHtml(s)}</li>`).join('')}</ul>
        <div class="detail-label">약점</div>
        <ul>${(analysis.weaknesses_a || []).map(w => `<li class="w">${escapeHtml(w)}</li>`).join('')}</ul>
      </div>
      <div>
        <div class="detail-label">프롬프트 B 강점</div>
        <ul>${(analysis.strengths_b || []).map(s => `<li class="s">${escapeHtml(s)}</li>`).join('')}</ul>
        <div class="detail-label">약점</div>
        <ul>${(analysis.weaknesses_b || []).map(w => `<li class="w">${escapeHtml(w)}</li>`).join('')}</ul>
      </div>
    </div>
    <div class="recommendation">
      <div class="rec-label">추천</div>
      <p>${escapeHtml(analysis.recommendation)}</p>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
