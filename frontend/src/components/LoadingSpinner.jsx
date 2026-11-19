export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
      <span className="spinner-text">{text}</span>
    </div>
  );
}
