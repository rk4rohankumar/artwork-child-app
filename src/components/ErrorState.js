const ErrorState = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <p className="text-red-600 font-semibold mb-3">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 bg-[var(--mfe-accent,#047857)] text-white rounded hover:bg-[var(--mfe-accent-ink,#065f46)] focus:outline-none focus:ring-2 focus:ring-[color:var(--mfe-accent,#047857)] focus:ring-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
