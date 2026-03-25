export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none">
      <rect width="400" height="400" fill="#f4f4f5" />
      <rect x="110" y="100" width="180" height="140" rx="18" fill="#e4e4e7" />
      <circle cx="165" cy="150" r="22" fill="#d4d4d8" />
      <path d="M110 285l72-72 46 46 36-36 76 62H110z" fill="#d4d4d8" />
      <text x="200" y="334" text-anchor="middle" fill="#71717a" font-family="Arial, sans-serif" font-size="24">
        No image
      </text>
    </svg>
  `)
