import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import ArtCard from "./components/ArtCard";
import ArtModal from "./components/ArtModal";
import Loader from "./components/Loader";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import Pagination from "./components/Pagination";
import useDebouncedValue from "./hooks/useDebouncedValue";

const LIMIT = 20;
const BASE = "https://api.artic.edu/api/v1/artworks";
const FIELDS = "id,title,image_id,artist_title";

const ArtworkPage = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [page, setPage] = useState(1);
  const [artworks, setArtworks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const fetchArtworks = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const url = debouncedQuery
          ? `${BASE}/search?q=${encodeURIComponent(
              debouncedQuery
            )}&page=${page}&limit=${LIMIT}&fields=${FIELDS}`
          : `${BASE}?page=${page}&limit=${LIMIT}&fields=${FIELDS}`;
        const res = await axios.get(url, { signal });
        setArtworks(res.data.data || []);
        const pag = res.data.pagination || {};
        setTotalPages(pag.total_pages || 1);
      } catch (err) {
        if (axios.isCancel?.(err) || err.name === "CanceledError") return;
        setError("Failed to fetch artwork data.");
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchArtworks(controller.signal);
    return () => controller.abort();
  }, [fetchArtworks, reloadTick]);

  const handleRetry = () => setReloadTick((n) => n + 1);
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const resultsLabel = loading
    ? "Loading artworks..."
    : `Showing ${artworks.length} artwork${artworks.length === 1 ? "" : "s"}${
        debouncedQuery ? ` for "${debouncedQuery}"` : ""
      }`;

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">
        Artworks Collection
      </h1>

      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="mb-6 flex justify-center"
      >
        <label htmlFor="art-search" className="sr-only">
          Search artworks
        </label>
        <input
          id="art-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artworks, artists..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      <p className="text-sm text-gray-600 text-center mb-4" aria-live="polite">
        {resultsLabel}
      </p>

      {loading && <Loader />}
      {!loading && error && (
        <ErrorState message={error} onRetry={handleRetry} />
      )}
      {!loading && !error && artworks.length === 0 && (
        <EmptyState
          message={
            debouncedQuery
              ? `No artworks match "${debouncedQuery}".`
              : "No artworks available."
          }
        />
      )}

      {!loading && !error && artworks.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((art) => (
              <ArtCard
                key={art.id}
                art={art}
                onOpen={(a) => setSelectedId(a.id)}
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </>
      )}

      {selectedId != null && (
        <ArtModal artId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </main>
  );
};

export default ArtworkPage;
