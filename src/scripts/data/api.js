import CONFIG from "../config.js";
import { getAccessToken } from "../utils/auth.js";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  GET_DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

// Register
export async function registerUser({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Login
export async function loginUser({ email, password }) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

// Add Story (with Auth)
export async function addStory({ description, photo, lat, lon }) {
  const token = getAccessToken();

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat !== undefined && lon !== undefined) {
    formData.append("lat", lat);
    formData.append("lon", lon);
  }

  const response = await fetch(ENDPOINTS.ADD_STORY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return response.json();
}

// Add Story (Guest)
export async function addStoryGuest({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);

  const response = await fetch(ENDPOINTS.ADD_STORY_GUEST, {
    method: "POST",
    body: formData,
  });
  return response.json();
}

// Get all stories
export async function getAllStories({ page, size, location } = {}) {
  try {
    const token = getAccessToken();
    if (!token) {
      return {
        error: true,
        message: "Anda belum login. Silahkan login terlebih dahulu.",
      };
    }

    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (size) params.append("size", size);
    if (location !== undefined) params.append("location", location);

    const url = `${ENDPOINTS.GET_ALL_STORIES}?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      return {
        error: true,
        message: errorResponse.message || "Gagal memuat cerita",
      };
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching stories:", error);
    return { error: true, message: "Terjadi kesalahan jaringan atau server." };
  }
}

// Get detail story
export async function getDetailStory(id) {
  const token = getAccessToken();
  const response = await fetch(ENDPOINTS.GET_DETAIL_STORY(id), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}

// Subscribe Push Notification
export async function subscribeNotification({
  endpoint,
  keys: { p256dh, auth },
}) {
  const response = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint, keys: { p256dh, auth } }),
  });
  return response.json();
}

// Unsubscribe Push Notification
export async function unsubscribeNotification({ endpoint }) {
  const response = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint }),
  });
  return response.json();
}
