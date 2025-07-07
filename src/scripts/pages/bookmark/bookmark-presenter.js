export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialBookmarkStories() {
    this.#view.showLoading();

    try {
      const listOfStories = await this.#model.getAllStories();
      const stories = await Promise.all(listOfStories);

      console.log("listOfStories from IndexedDB:", listOfStories);
      console.log("stories:", stories);

      const message = "Berhasil mendapatkan daftar Story yang tersimpan";
      this.#view.populateBookmarkStories(message, stories);
    } catch (error) {
      console.error("initialBookmarkStories error", error);
      this.#view.populateBookmarkStoriesError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
