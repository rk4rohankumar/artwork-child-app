import { useEffect, useRef, useState } from "react";
import axios from "axios";

const BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

const ArtModal = ({ artId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${BASE}/objects/${artId}`);
        if (!cancelled) setDetail(res.data);
      } catch {
        if (!cancelled) setError("Failed to load artwork details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [artId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const imageUrl = detail?.primaryImage || detail?.primaryImageSmall || "";
  const hasImage = Boolean(imageUrl) && !imgError;

  const fields = [
    ["Artist", detail?.artistDisplayName],
    ["Date", detail?.objectDate],
    ["Medium", detail?.medium],
    ["Dimensions", detail?.dimensions],
    ["Department", detail?.department],
    ["Culture", detail?.culture],
    ["Credit", detail?.creditLine],
  ].filter(([, v]) => v);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="art-modal-title"
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2
            id="art-modal-title"
            className="text-xl font-bold text-gray-900 pr-4"
          >
            {detail?.title || "Artwork"}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {loading && (
            <p className="text-gray-600 py-8 text-center" aria-live="polite">
              Loading details...
            </p>
          )}
          {error && (
            <p className="text-red-600 py-8 text-center" role="alert">
              {error}
            </p>
          )}
          {detail && (
            <div className="space-y-4">
              {hasImage ? (
                <img
                  src={imageUrl}
                  alt={detail.title || "Artwork"}
                  loading="lazy"
                  decoding="async"
                  onError={() => setImgError(true)}
                  className="w-full max-h-96 object-contain bg-gray-50 rounded"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 rounded">
                  <span className="text-stone-600 text-sm">
                    No image available
                  </span>
                </div>
              )}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {fields.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="font-semibold text-gray-700">{label}</dt>
                    <dd className="text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
              {detail.objectURL && (
                <a
                  href={detail.objectURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-blue-600 hover:underline text-sm font-medium"
                >
                  View on metmuseum.org
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtModal;
