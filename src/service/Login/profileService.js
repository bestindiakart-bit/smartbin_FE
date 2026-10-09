import api from "./Login";

// The backend profile-update endpoint was not supplied.
// Set VITE_PROFILE_UPDATE_ENDPOINT to the REAL endpoint, e.g. in .env.
// Do not guess the endpoint: update is unavailable until configured.
export const updateMyProfile = (payload) => {
  const endpoint = import.meta.env.VITE_PROFILE_UPDATE_ENDPOINT;
  if (!endpoint) throw new Error("Profile update API is not configured. Set VITE_PROFILE_UPDATE_ENDPOINT to your backend's update endpoint.");
  return api.patch(endpoint, payload);
};
