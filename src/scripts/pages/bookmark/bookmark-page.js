import BookmarkPresenter from "./bookmark-presenter";
import Database from "../../data/database";
import Swal from "sweetalert2";

export default class BookmarkPage {
  #presenter;

  async render() {
    return `
      <section class="bookmark-container">
        <h1 class="title">List Story yang Tersimpan</h1>
        <div id="story-list" class="story-list"></div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database
    });

    await this.#presenter.initialBookmarkStories();
    this._attachDeleteHandlers();
  }

  populateBookmarkStories(message, listStory) {
    const storyListElement = document.getElementById("story-list");
    storyListElement.innerHTML = "";

    listStory.forEach((story) => {
      const storyItem = document.createElement("article");
      storyItem.classList.add("story-card");

      const formattedDate = new Date(story.createdAt)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      storyItem.innerHTML = `
      <img src="${story.photoUrl}" alt="${story.name}" onerror="this.src='fallback.jpg'" />
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <small>${formattedDate}</small>
        <div class="button-group">
        <button class="detail-btn" aria-label="Bookmark cerita ${story.name}" onclick="location.hash = '/detail/${story.id}'" onkeydown="if(event.key==='Enter'){ location.hash = '/detail/${story.id}'; }">
          <i class="fa-solid fa-chevron-right"></i> Read more
        </button>
        <button class="delete-button" data-id="${story.id}">Hapus</button>
        </div>  
      `;

      storyListElement.appendChild(storyItem);
    });

    this._attachDeleteHandlers();
  }

  populateBookmarkStoriesListEmpty() {
    const storyListElement = document.getElementById("story-list");
    storyListElement.innerHTML = `<p>Belum ada story yang disimpan.</p>`;
  }

  populateBookmarkStoriesError(message) {
    const storyListElement = document.getElementById("story-list");
    storyListElement.innerHTML = `<p class="error">${message}</p>`;
  }

  showLoading() {
    const storyListElement = document.getElementById("story-list");
    storyListElement.innerHTML = `<p>Memuat data...</p>`;
  }

  hideLoading() {}

  _attachDeleteHandlers() {
    const buttons = document.querySelectorAll(".delete-button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const storyId = e.target.dataset.id;

        const confirm = await Swal.fire({
          title: "Yakin ingin menghapus?",
          text: "Cerita ini akan dihapus dari daftar bookmark kamu.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Ya, hapus",
          cancelButtonText: "Batal"
        });

        if (confirm.isConfirmed) {
          try {
            await Database.removeStory(storyId);
            await this.#presenter.initialBookmarkStories();

            Swal.fire({
              icon: "success",
              title: "Dihapus!",
              text: "Cerita telah dihapus dari bookmark.",
              timer: 1500,
              showConfirmButton: false
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Gagal",
              text: "Terjadi kesalahan saat menghapus bookmark.",
              showConfirmButton: true
            });
          }
        }
      });
    });
  }
}
