const Pagination = ({ page, totalPages, onPrev, onNext }) => {
  const safeTotal = Math.max(1, totalPages || 1);
  const canPrev = page > 1;
  const canNext = page < safeTotal;

  return (
    <nav
      className="flex items-center justify-center gap-4 mt-8"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        className="px-4 py-2 bg-[var(--mfe-surface,#ffffff)] border border-[color:var(--mfe-border,#e2e8f0)] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--mfe-sunken,#f8fafc)] focus:outline-none focus:ring-2 focus:ring-[color:var(--mfe-accent,#047857)]"
      >
        Prev
      </button>
      <span className="text-sm text-[color:var(--mfe-muted,#475569)]" aria-live="polite">
        Page <strong>{page}</strong> of <strong>{safeTotal}</strong>
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="px-4 py-2 bg-[var(--mfe-surface,#ffffff)] border border-[color:var(--mfe-border,#e2e8f0)] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--mfe-sunken,#f8fafc)] focus:outline-none focus:ring-2 focus:ring-[color:var(--mfe-accent,#047857)]"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
