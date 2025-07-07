export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async getAllStories() {
    this.#view.showLoading();
    try {
      const response = await this.#model.getAllStories();

      if (!response.error) {
        this.#view.showStories(response.listStory);
      } else {
        this.#view.showError(response.message);
      }
    } catch (error) {
      this.#view.showError("Gagal memuat cerita. Silakan coba lagi.");
    } finally {
      this.#view.hideLoading();
    }
  }
}
