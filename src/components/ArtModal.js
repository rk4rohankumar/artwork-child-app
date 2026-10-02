import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ImagePlaceholder from "./ImagePlaceholder";

const BASE = "https://collectionapi.metmuseum.org/public/collection/v1";
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ArtModal = ({ artId, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const dialogRef = useRef(null);
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

  // Escape closes, Tab is trapped inside the dialog, and focus returns to
  // whatever opened the modal (the card button) once it unmounts.
  useEffect(() => {
    const opener = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (!focusable.length) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && typeof opener.focus === "function") opener.focus();
    };
  }, [onClose]);

  const imageUrl = detail?.primaryImage || detail?.primaryImageSmall || "";
  const hasImage = Boolean(imageUrl) && !imgError;
  const title = detail?.title || "Untitled";
  const artist = detail?.artistDisplayName || "Unknown Artist";

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="art-modal-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-gray-200 bg-white p-4">
          <h2
            id="art-modal-title"
            className="pr-4 text-xl font-bold text-gray-900"
          >
            {detail?.title || "Artwork"}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              focusable="false"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {loading && (
            <p className="py-8 text-center text-gray-600" aria-live="polite">
              Loading details...
            </p>
          )}
          {error && (
            <p className="py-8 text-center text-red-600" role="alert">
              {error}
            </p>
          )}
          {detail && (
            <div className="space-y-4">
              <div className="h-64 w-full overflow-hidden rounded bg-gray-50 sm:h-96">
                {hasImage ? (
                  <img
                    src={imageUrl}
                    alt={`${title} by ${artist}`}
                    loading="lazy"
                    decoding="async"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImagePlaceholder label={`No image available for ${title}`} />
                )}
              </div>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
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
                  className="inline-block text-sm font-medium text-blue-600 hover:underline"
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
