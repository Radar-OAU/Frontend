import useAuthStore from "@/store/authStore";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error) {
  if (!error) return "An unknown error occurred";

  if (typeof error === "string") return error;

  if (error.response && error.response.data) {
    const data = error.response.data;

    // Check for 'detail' (common in DRF)
    if (data.detail) return data.detail;

    // Check for 'error' key
    if (data.error) return data.error;

    // Check for 'message' key
    if (data.message) return data.message;

    // Check for field errors (arrays)
    // e.g. { email: ["Invalid email"], password: ["Too short"] }
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const firstError = data[firstKey];
      if (Array.isArray(firstError)) {
        return `${firstKey}: ${firstError[0]}`;
      }
      if (typeof firstError === "string") {
        return `${firstKey}: ${firstError}`;
      }
    }
  }

  return error.message || "Something went wrong";
}

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const baseUrl = "https://radar-ufvb.onrender.com";
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
