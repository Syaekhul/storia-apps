import CONFIG from "../config";
import { getActiveRoute } from "../routes/url-parser.js";

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
    if (accessToken === "null" || accessToken === "undefined") {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}
export function putAccessToken(token) {
  try {
    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("Error setting access token:", error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error("Error removing access token:", error);
    return false;
  }
}

const unauthenticatedRoutes = ["/login", "/register"];

export function checkAuthenticatedRoute(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (isLogin) {
    location.hash = "/";
    return null;
  }

  return page;
}

export function checkUnauthenticatedRouteOnly(page) {
  const isLogin = !!getAccessToken();

  if (isLogin) {
    location.hash = "/";
    return null;
  }

  return page;
}

export function getLogout() {
  removeAccessToken();
}
