import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { getAccessToken } from "../utils/auth";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe
} from "../utils/notification-helper";
import { registerServiceWorker } from "../utils/index";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  async #setupPushNotification() {
    const pushNotificaitonTools = document.getElementById(
      "push-notification-tools"
    );

    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    if (isSubscribed) {
      pushNotificaitonTools.innerHTML = `
        <button id="unsubscribe-button"><i class="fa-solid fa-bell-slash"></i>Unsubscribe</button>
      `;
      document
        .getElementById("unsubscribe-button")
        .addEventListener("click", () => {
          unsubscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
    } else {
      pushNotificaitonTools.innerHTML = `
        <button id="subscribe-button"><i class="fa-solid fa-bell"></i>Subscribe</button>
      `;
      document
        .getElementById("subscribe-button")
        .addEventListener("click", () => {
          subscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url] || null;
    const header = document.querySelector("header");

    if (url === "/login" || url === "/register") {
      if (header) header.style.display = "none";
    } else {
      if (header) header.style.display = "block";
    }

    // ⛔ JANGAN pakai window.addEventListener di sini lagi
    await registerServiceWorker(); // ✅ Tunggu sampai service worker siap

    const page = route();

    if (document.startViewTransition) {
      await document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    }

    // ✅ Setelah service worker siap dan halaman dirender
    if (getAccessToken()) {
      await this.#setupPushNotification();
    }
  }
}

export default App;
