import { apiBaseUrl } from "../api";
import PlaceholderProfile from "../assets/placeholder_profile.png";

export const buildProfileImageUrl = (imagePath?: string | null): string => {
  if (!imagePath) {
    return PlaceholderProfile;
  }

  const normalizedPath = imagePath.trim();

  if (!normalizedPath) {
    return PlaceholderProfile;
  }

  if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith("https//")) {
    return `https://${normalizedPath.slice("https//".length)}`;
  }

  if (normalizedPath.startsWith("http//")) {
    return `http://${normalizedPath.slice("http//".length)}`;
  }

  if (normalizedPath.startsWith("/")) {
    return `${apiBaseUrl}${normalizedPath}`;
  }

  return `${apiBaseUrl}/${normalizedPath}`;
};

export default buildProfileImageUrl;

