import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import ArtCard from "./components/ArtCard";
import ArtModal from "./components/ArtModal";
import Loader from "./components/Loader";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import Pagination from "./components/Pagination";
import useDebouncedValue from "./hooks/useDebouncedValue";

const PAGE_SIZE = 20;
const OVERFETCH = 30;
const BASE = "https://collectionapi.metmuseum.org/public/collection/v1";
const DEFAULT_QUERY = "painting";

const normalize = (obj) => ({
  id: obj.objectID,
  title: obj.title || "Untitled",
  artist: obj.artistDisplayName || "Unknown Artist",
  imageUrl: obj.primaryImageSmall || obj.primaryImage || "",
  objectURL: obj.objectURL,
});

const ArtworkPage = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [page, setPage] = useState(1);
  const [allIds, setAllIds] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const idsCacheKey = useRef("");

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const fetchIds = useCallback(
    async (signal) => {
      const q = debouncedQuery || DEFAULT_QUERY;
      if (idsCacheKey.current === q && allIds.length) return allIds;
      const res = await axios.get(`${BASE}/search`, {
        params: { q, hasImages: true },
        signal,
      });
      const ids = res.data?.objectIDs || [];
      idsCacheKey.current = q;
      setAllIds(ids);
      return ids;
    },
    [debouncedQuery, allIds]
  );

  const fetchPage = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const ids = await fetchIds(signal);
        if (!ids.length) {
          setArtworks([]);
          return;
        }
        const start = (page - 1) * PAGE_SIZE;
        const slice = ids.slice(start, start + OVERFETCH);
        const results = await Promise.all(
          slice.map((id) =>
            axios
              .get(`${BASE}/objects/${id}`, { signal })
              .then((r) => r.data)
              .catch(() => null)
          )
        );
        const normalized = results
          .filter((o) => o && (o.primaryImageSmall || o.primaryImage))
          .slice(0, PAGE_SIZE)
          .map(normalize);
        setArtworks(normalized);
      } catch (err) {
        if (axios.isCancel?.(err) || err.name === "CanceledError") return;
        setError("Failed to fetch artwork data.");
      } finally {
        setLoading(false);
      }
    },
    [fetchIds, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPage(controller.signal);
    return () => controller.abort();
  }, [fetchPage, reloadTick]);

  const handleRetry = () => setReloadTick((n) => n + 1);
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const totalPages = Math.max(1, Math.ceil(allIds.length / PAGE_SIZE));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const resultsLabel = loading
    ? "Loading artworks..."
    : `Showing ${artworks.length} artwork${artworks.length === 1 ? "" : "s"}${
        debouncedQuery ? ` for "${debouncedQuery}"` : ""
      } — ${allIds.length} total with images`;

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-2">
        Artworks Collection
      </h1>
      <p className="text-center text-xs text-gray-500 mb-6">
        Powered by The Metropolitan Museum of Art Open Access API.
      </p>

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
