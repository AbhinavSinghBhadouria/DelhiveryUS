export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="alert alert-error" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
