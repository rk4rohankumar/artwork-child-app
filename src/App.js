import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./index.css";
import ArtCard from "./components/ArtCard";
import ArtModal from "./components/ArtModal";
import Loader from "./components/Loader";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import Pagination from "./components/Pagination";
import useDebouncedValue from "./hooks/useDebouncedValue";

// Object IDs requested per page. /v1.1/search is paginated server-side via
// offset/limit; hasImages=true only guarantees the Met holds an image, not
// that it is Open Access, so cards without a primaryImageSmall are dropped.
const PAGE_SIZE = 30;
const BASE = "https://collectionapi.metmuseum.org/public/collection/v1";
const SEARCH_URL = "https://collectionapi.metmuseum.org/public/collection/v1.1/search";
const DEFAULT_QUERY = "landscape";

const normalize = (obj) => ({
  id: obj.objectID,
  title: obj.title || "Untitled",
  artist: obj.artistDisplayName || "Unknown Artist",
  imageUrl: obj.primaryImageSmall || "",
  objectURL: obj.objectURL,
});

const ArtworkPage = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const fetchPage = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(SEARCH_URL, {
          params: {
            q: debouncedQuery || DEFAULT_QUERY,
            hasImages: true,
            offset: (page - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
          },
          signal,
        });
        const ids = res.data?.objectIDs || [];
        setTotal(res.data?.total || 0);
        if (!ids.length) {
          setArtworks([]);
          return;
        }
        const results = await Promise.all(
          ids.map((id) =>
            axios
              .get(`${BASE}/objects/${id}`, { signal })
              .then((r) => r.data)
              .catch(() => null)
          )
        );
        setArtworks(
          results.filter((o) => o && o.primaryImageSmall).map(normalize)
        );
      } catch (err) {
        if (axios.isCancel?.(err) || err.name === "CanceledError") return;
        setError("Failed to fetch artwork data.");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [debouncedQuery, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPage(controller.signal);
    return () => controller.abort();
  }, [fetchPage, reloadTick]);

  const handleRetry = () => setReloadTick((n) => n + 1);
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const resultsLabel = loading
    ? "Loading artworks..."
    : `Showing ${artworks.length} artwork${artworks.length === 1 ? "" : "s"}${
        debouncedQuery ? ` for "${debouncedQuery}"` : ""
      } — ${total.toLocaleString()} matching objects`;

  return (
    <section className="max-w-6xl mx-auto p-4" aria-labelledby="artwork-heading">
      <h1 id="artwork-heading" className="text-3xl font-bold text-center mb-2">
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
              ? `No artworks with images match "${debouncedQuery}".`
              : "No artworks available."
          }
        />
      )}

      {!loading && !error && artworks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((art, i) => (
            <ArtCard
              key={art.id}
              art={art}
              priority={i < 3}
              onOpen={(a) => setSelectedId(a.id)}
            />
          ))}
        </div>
      )}

      {!loading && !error && total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      {selectedId != null && (
        <ArtModal artId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </section>
  );
};

export default ArtworkPage;
