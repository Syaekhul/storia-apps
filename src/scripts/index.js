// CSS imports
import "../styles/styles.css";
import App from "./pages/app";
import { getActiveRoute } from "./routes/url-parser";
import { getAccessToken, getLogout } from "./utils/auth";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer")
  });

  const renderWithRedirect = async () => {
    const url = getActiveRoute();
    const token = getAccessToken();
    const isAuthPage = url === "/login" || url === "/register";

    if (!token && !isAuthPage) {
      window.location.hash = "/login";
      return;
    }

    if (token && url === "/") {
      window.location.hash = "/home";
      return;
    }

    await app.renderPage();
  };

  await renderWithRedirect();

  window.addEventListener("hashchange", async () => {
    await renderWithRedirect();
  });

  const skipLink = document.getElementById("skip-link");
  const mainContent = document.getElementById("main-content");

  if (skipLink && mainContent) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      requestAnimationFrame(() => {
        mainContent.focus();
      });
    });
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      getLogout();
      Swal.fire({
        icon: "success",
        title: "Logout Berhasil",
        text: "Anda telah berhasil logout."
      });
      window.location.href = "/#/login";
    });
  }
});
