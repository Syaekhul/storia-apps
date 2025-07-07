import LoginPresenter from "./login-presenter";
import * as StorieAPI from "../../../data/api";
import * as Auth from "../../../utils/auth";
import Swal from "sweetalert2";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
    <div class="login-page-wrapper">
      <section class="login-container">
        <h1>Selamat Datang</h1>
        <div class="login-form">
          <form id="login-form">
            <div class="form-group">
              <label for="input-email">Email</label>
              <input type="email" id="input-email" name="email" placeholder="johndoe@gmail.com" required />
            </div>

            <div class="form-group password-input-wrapper">
              <label for="input-password">Password</label>
              <input type="password" id="input-password" name="password" placeholder="*********" required />
              <i class="fa-regular fa-eye toggle-password-icon" id="toggle-password" aria-label="Tampilkan password" tabindex="0"></i>
            </div>

            <small class="password-warning" id="password-warning">
              Password harus minimal 8 karakter.
            </small>

            <div class="button-form">
              <button type="submit">Login</button>
            </div>
          </form>
        </div>

        <div class="register-link">
          <p>Belum punya akun? <a href="#/register">Register</a></p>
        </div>
      </section>
    </div>
        `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StorieAPI,
    });

    this.#setupForm();
    this.#setupPasswordToggle();
    this.#setupPasswordValidation();
  }

  #setupForm() {
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("input-email").value;
      const password = document.getElementById("input-password").value;

      this.showLoading();

      try {
        const response = await StorieAPI.loginUser({ email, password });

        if (response.error) {
          Swal.fire({
            icon: "error",
            title: "Login gagal",
            text: response.message || "Silakan coba lagi",
          });
        } else {
          Auth.putAccessToken(response.loginResult.token);
          Swal.fire({
            icon: "success",
            title: "Login berhasil",
            text: "Selamat datang di Storie!",
          }).then(() => {
            location.hash = "/home";
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Terjadi kesalahan",
          text: "Login gagal. Silakan coba lagi",
        });
      } finally {
        this.hideLoading();
      }
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

  showLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("loading-overlay").style.display = "none";
  }
}
