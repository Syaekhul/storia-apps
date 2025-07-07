import RegisterPresenter from "./register-presenter";
import * as StorieAPI from "../../../data/api";
import Swal from "sweetalert2";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
    <div class="register-page-wrapper">
      <section class="register-container">
        <h1>Daftar Akun</h1>
        <div class="register-form">
          <form id="register-form">
            <div class="form-group">
              <label for="input-name">Nama</label>
              <input type="text" id="input-name" name="name" placeholder="John Doe" required />
            </div>

            <div class="form-group">
              <label for="input-email">Email</label>
              <input type="email" id="input-email" name="email" placeholder="johndoe@gmail.com" required />
            </div>

            <div class="form-group password-input-wrapper">
              <label for="input-password">Password</label>
              <input type="password" id="input-password" name="password" placeholder="********" required />
              <i class="fa-regular fa-eye toggle-password-icon" id="toggle-password" aria-label="Tampilkan password" tabindex="0"></i>
            </div>

            <small class="password-warning" id="password-warning">
              Password harus minimal 8 karakter.
            </small>

            <div class="button-form">
              <button type="submit">Daftar</button>
            </div>
          </form>
        </div>

        <div class="login-link">
          <p>Sudah punya akun? <a href="#/login">Login</a></p>
        </div>
      </section>
    </div>
        `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: StorieAPI,
    });

    this.#setupForm();
    this.#setupPasswordToggle();
    this.#setupPasswordValidation();
  }

  #setupForm() {
    const formElement = document.getElementById("register-form");
    formElement.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = {
        name: document.getElementById("input-name").value,
        email: document.getElementById("input-email").value,
        password: document.getElementById("input-password").value,
      };

      this.showLoading();
      await this.#presenter.registerUser(data);
    });
  }

  #setupPasswordToggle() {
    const togglePassword = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("input-password");

    togglePassword.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePassword.classList.toggle("fa-eye");
      togglePassword.classList.toggle("fa-eye-slash");
    });
  }

  #setupPasswordValidation() {
    const passwordInput = document.getElementById("input-password");
    const passwordWarning = document.getElementById("password-warning");

    passwordInput.addEventListener("input", () => {
      if (passwordInput.value.length < 8) {
        passwordWarning.style.display = "block";
      } else {
        passwordWarning.style.display = "none";
      }
    });
  }

  registeredFailed(message) {
    Swal.fire({
      icon: "error",
      title: "Pendaftaran gagal",
      text: message || "Pendaftaran gagal. Silakan coba lagi",
    });
    this.hideLoading();
  }

  registeredSuccess() {
    Swal.fire({
      icon: "success",
      title: "Pendaftaran berhasil",
      text: "Pendaftaran berhasil! Silakan login untuk melanjutkan.",
    }).then(() => {
      location.hash = "/login";
    });
    this.hideLoading();
  }

  showLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("loading-overlay").style.display = "none";
  }
}
