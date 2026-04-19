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
        className="px-4 py-2 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Prev
      </button>
      <span className="text-sm text-gray-700" aria-live="polite">
        Page <strong>{page}</strong> of <strong>{safeTotal}</strong>
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="px-4 py-2 bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
