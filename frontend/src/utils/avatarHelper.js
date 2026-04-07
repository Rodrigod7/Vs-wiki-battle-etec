// frontend/src/utils/avatarHelper.js

const AVATAR_COLORS = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
  '#3498db', '#9b59b6', '#e91e63', '#00bcd4', '#ff5722',
  '#795548', '#607d8b', '#8bc34a', '#ff9800', '#673ab7'
];

/**
 * Returns a deterministic color based on the username
 */
const getColorForUsername = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

/**
 * Returns a data URI SVG avatar with the user's initial and a deterministic background color.
 * @param {string} username
 * @param {number} size - pixel size (default 60)
 */
export const getDefaultAvatar = (username, size = 60) => {
  if (!username) return `https://placehold.co/${size}x${size}/3498db/FFFFFF?text=%3F`;
  const initial = username.charAt(0).toUpperCase();
  const color = getColorForUsername(username);
  const fontSize = Math.round(size * 0.45);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="${color}"/>
    <text x="50%" y="50%" dy=".1em" fill="white" font-family="Arial,sans-serif" font-size="${fontSize}" font-weight="bold" text-anchor="middle" dominant-baseline="central">${initial}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Returns the avatar URL if available, otherwise generates a default avatar.
 * @param {string|null} avatarUrl
 * @param {string} username
 * @param {number} size
 */
export const getAvatarUrl = (avatarUrl, username, size = 60) => {
  if (avatarUrl) return avatarUrl;
  return getDefaultAvatar(username || '?', size);
};
