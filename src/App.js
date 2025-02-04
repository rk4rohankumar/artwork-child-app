import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import 'tailwindcss/tailwind.css';
const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <motion.div
        className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity }}
      ></motion.div>
      <p className="text-lg font-semibold text-gray-700 mt-4">Fetching beautiful artworks...</p>
    </div>
  );
};

const ArtworkPage = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await axios.get("https://api.artic.edu/api/v1/artworks?limit=100");
        setArtworks(response.data.data);
      } catch (err) {
        setError("Failed to fetch artwork data.");
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">🎨 Artworks Collection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((art, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={`https://www.artic.edu/iiif/2/${art.image_id}/full/400,/0/default.jpg`}
              alt={art.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{art.title || "Untitled"}</h2>
              <p className="text-gray-600 text-sm">{art.artist_title || "Unknown Artist"}</p>
              <a
                href={`https://www.artic.edu/artworks/${art.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm hover:underline mt-2 block"
              >
                View Details
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ArtworkPage;
