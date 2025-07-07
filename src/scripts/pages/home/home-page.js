import HomePresenter from "./home-presenter";
import * as StorieAPI from "../../data/api";
import Database from "../../data/database";
import Swal from "sweetalert2";

export default class HomePage {
  #presenter = null;

  async render() {
    return `
      <section id="main-content">
        <div class="home-container">
          <h1 class="title">Cerita Hari ini</h1>
          <div id="story-list" class="story-list"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StorieAPI,
      dbModel: Database
    });

    await this.#presenter.getAllStories();
  }

  showStories(stories) {
    const storiesContainer = document.getElementById("story-list");
    if (!stories || stories.length === 0) {
      storiesContainer.innerHTML = `
        <p>Tidak ada cerita tersedia.</p>
      `;
      return;
    }

    storiesContainer.innerHTML = stories
      .slice(0, 10)
      .map((story) => {
        const formattedDate = new Date(story.createdAt)
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        return `
      <article class="story-card" tabindex="0" role="button" aria-label="Buka Cerita ${story.name}">
        <img src="${story.photoUrl}" alt="${story.name}" onerror="this.src='fallback.jpg'" />
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <small>${formattedDate}</small>
        <div class="button-group">
        <button class="detail-btn" aria-label="Bookmark cerita ${story.name}" onclick="location.hash = '/detail/${story.id}'" onkeydown="if(event.key==='Enter'){ location.hash = '/detail/${story.id}'; }">
          <i class="fa-solid fa-chevron-right"></i> Read more
        </button>
        <button class="bookmark-btn" aria-label="Bookmark cerita ${story.name}" data-id="${story.id}">
          <i class="fa-regular fa-bookmark"></i>
        </button>
        </div>
      </article>
      `;
      })
      .join("");

    this.saveBookmark();
  }

  saveBookmark() {
    const bookmarkBtn = document.querySelectorAll(".bookmark-btn");

    bookmarkBtn.forEach(async (btn) => {
      const storyId = btn.getAttribute("data-id");

      const isBookmarked = await Database.getStoryById(storyId);
      if (isBookmarked) {
        btn.innerHTML = `<i class="fa-solid fa-bookmark"></i>`;
      }

      btn.addEventListener("click", async () => {
        const storyCard = btn.closest(".story-card");
        const name = storyCard.querySelector("h2").textContent;
        const description = storyCard.querySelector("p").textContent;
        const photoUrl = storyCard.querySelector("img").src;
        const createdAt = storyCard.querySelector("small").textContent;

        const story = {
          id: storyId,
          name,
          description,
          photoUrl,
          createdAt
        };

        try {
          const existing = await Database.getStoryById(storyId);
          if (existing) {
            await Database.removeStory(storyId);
            btn.innerHTML = `<i class="fa-regular fa-bookmark"></i>`;
            Swal.fire({
              icon: "info",
              title: "Dihapus",
              text: `"${name}" telah dihapus dari Bookmark`,
              showConfirmButton: true
            });
          } else {
            await Database.putStory(story);
            btn.innerHTML = `<i class="fa-solid fa-bookmark"></i>`;
            Swal.fire({
              icon: "info",
              title: "Ditambahkan",
              text: `"${name}" telah ditambahkan ke Bookmark`,
              showConfirmButton: true
            });
          }
        } catch (error) {
          console.error("Bookmark toggle error:", error);
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Gagal mengubah status bookmark",
            showConfirmButton: true
          });
        }
      });
    });
  }

  showError(message) {
    document.getElementById("story-list").innerHTML = `
      <div class="error-message">
        <p>${message} <a href="#/login">Login</a></p>
      </div>
    `;
  }

  showLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("loading-overlay").style.display = "none";
  }
}
