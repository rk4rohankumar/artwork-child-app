import { useState } from "react";

const imageUrl = (id) =>
  `https://www.artic.edu/iiif/2/${id}/full/400,/0/default.jpg`;

const ArtCard = ({ art, onOpen }) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(art.image_id) && !imgError;

  return (
    <button
      type="button"
      onClick={() => onOpen(art)}
      className="group text-left bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 motion-reduce:transition-none hover:-translate-y-1 motion-reduce:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label={`View details for ${art.title || "Untitled"}`}
    >
      {hasImage ? (
        <img
          src={imageUrl(art.image_id)}
          alt={art.title || "Artwork"}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-56 object-cover bg-gray-100"
        />
      ) : (
        <div
          className="w-full h-56 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4"
          aria-hidden="true"
        >
          <span className="text-gray-500 text-sm font-medium text-center line-clamp-3">
            {art.title || "Untitled"}
          </span>
        </div>
      )}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {art.title || "Untitled"}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {art.artist_title || "Unknown Artist"}
        </p>
      </div>
    </button>
  );
};

export default ArtCard;
