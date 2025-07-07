export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showLoading();
    try {
      const response = await this.#authModel.getLogin({ email, password });

      if (!response.ok) {
        this.#view.showError(response.message);
        return;
      }

      this.#authModel.putAccessToken(response.loginResult.token);
      this.#view.showSuccess("Login berhasil!");
    } catch (error) {
      this.#view.showError("Login gagal. Silakan coba lagi.");
    } finally {
      this.#view.hideLoading();
    }
  }
}
