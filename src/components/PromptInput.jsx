export default function PromptInput({ label, value, onChange, placeholder, badge }) {
  return (
    <div className="prompt-input-wrapper">
      <div className="prompt-label-row">
        <span className="prompt-label">{label}</span>
        {badge && <span className="prompt-badge">{badge}</span>}
        <span className="char-count">{value.length} chars</span>
      </div>
      <textarea
        className="prompt-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        spellCheck={false}
      />
    </div>
  );
}
