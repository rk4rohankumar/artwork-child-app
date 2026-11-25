import { useState } from "react";
import ImagePlaceholder from "./ImagePlaceholder";

// `priority` marks first-row cards: eager + high fetch priority so the LCP
// image is not deprioritised by lazy loading; everything else stays lazy.
const ArtCard = ({ art, onOpen, priority = false }) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(art.imageUrl) && !imgError;
  const alt = `${art.title} by ${art.artist}`;

  return (
    <article className="group relative overflow-hidden rounded-[var(--mfe-radius,12px)] bg-[var(--mfe-surface,#ffffff)] shadow-sm transition-transform duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="aspect-[4/3] w-full bg-[var(--mfe-sunken,#f8fafc)]">
        {hasImage ? (
          <img
            src={art.imageUrl}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholder label={`No image available for ${art.title}`} />
        )}
      </div>
      <div className="p-4">
        <h2 className="line-clamp-2 text-lg font-semibold text-[color:var(--mfe-ink,#0f172a)]">
          <button
            type="button"
            onClick={() => onOpen(art)}
            className="text-left focus:outline-none after:absolute after:inset-0 after:content-['']"
          >
            {art.title}
            <span className="sr-only">, view details</span>
          </button>
        </h2>
        <p className="mt-1 text-sm text-[color:var(--mfe-muted,#475569)]">{art.artist}</p>
      </div>
    </article>
  );
};

export default ArtCard;
