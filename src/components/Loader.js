const Loader = ({ label = "Fetching beautiful artworks..." }) => {
  return (
    <div
      className="flex flex-col items-center justify-center py-16"
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin motion-reduce:animate-none" />
      <p className="text-base font-medium text-gray-700 mt-4">{label}</p>
    </div>
  );
};

export default Loader;
