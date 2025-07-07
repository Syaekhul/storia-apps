import { registerUser } from "../../../data/api";

export default class RegisterPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async registerUser(data) {
    try {
      const response = await this.#model.registerUser(data);
      if (response.error) {
        this.#view.registeredFailed(response.message);
      } else {
        this.#view.registeredSuccess();
      }
    } catch (error) {
      this.#view.registeredFailed("Terjadi kesalahan jaringan atau server.");
    }
  }
}
