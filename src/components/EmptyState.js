const EmptyState = ({ message = "No artworks found." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default EmptyState;
