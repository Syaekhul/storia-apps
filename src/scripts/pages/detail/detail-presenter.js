export default class DetailPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async getDetailStory(id) {
    this.#view.showLoading();
    try {
      const response = await this.#model.getDetailStory(id);

      if (response.error) {
        this.#view.showError(
          response.message || "Gagal mengambil detail cerita."
        );
        return;
      }

      this.#view.showDetailStory(response.story);
    } catch (error) {
      this.#view.showError("Gagal memuat cerita. Silakan coba lagi.");
    } finally {
      this.#view.hideLoading();
    }
  }
}
