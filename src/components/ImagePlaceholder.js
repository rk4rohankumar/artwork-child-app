// Inline SVG shown when an artwork has no image or the image fails to load.
const ImagePlaceholder = ({ label = "No image available", className = "" }) => (
  <div
    role="img"
    aria-label={label}
    className={`flex h-full w-full items-center justify-center bg-stone-100 text-stone-500 ${className}`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="48"
      height="48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="6" y="8" width="36" height="32" rx="3" />
      <circle cx="17" cy="19" r="3.5" />
      <path d="M6 34l10-10 8 8 6-6 12 12" />
    </svg>
  </div>
);

export default ImagePlaceholder;
