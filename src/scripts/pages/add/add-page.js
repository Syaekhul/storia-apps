import AddPresenter from "./add-presenter";
import * as StorieAPI from "../../data/api";
import { initCamera, stopCamera } from "../../utils/camera";
import Swal from "sweetalert2";

export default class AddPage {
  #presenter;
  #camera;
  #cameraCaptured = false;

  async render() {
    return `
      <section class="add-story">
      <div class="add-story-container">
        <h2>Tambah Cerita Baru</h2>
        <form id="addStoryForm">
          <label for="photoInput">Foto:</label>
          <input type="file" id="photoInput" accept="image/*" />

        <div class="camera-controls">
            <button type="button" id="startCameraBtn">Gunakan Kamera</button>
            <button type="button" id="captureBtn" style="display:none;">Ambil Gambar</button>
        </div>

            <video id="cameraPreview" autoplay playsinline style="display:none;" tabindex="-1" aria-label="Pratinjau Kamera"></video>
            <canvas id="cameraCanvas" style="display:none;" tabindex="-1" aria-label="Gambar dari Kamera"></canvas>

        <div id="descriptionWrapper" style="display:block;">
            <label for="description">Deskripsi:</label>
            <textarea id="description" rows="3" required></textarea>
        </div>

          <div id="map" style="height: 300px; margin-top: 1rem;"></div>
          <input type="hidden" id="lat" name="lat" />
          <input type="hidden" id="lon" name="lon" />

          <button type="submit">Kirim Cerita</button>
        </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new AddPresenter({
      view: this,
      model: StorieAPI
    });

    this.#setupForm();
    this.#setupCamera();
    this.#presenter.initiateMap();
  }

  async #setupForm() {
    const formElement = document.getElementById("addStoryForm");
    const photoInput = document.getElementById("photoInput");

    photoInput.addEventListener("change", () => {
      const file = photoInput.files[0];
      const maxSize = 1 * 1024 * 1024;

      if (file && file.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "Ukuran file terlalu besar",
          text: "Silakan pilih foto dengan ukuran maksimal 1 MB."
        });

        photoInput.value = "";
      }
    });

    formElement.addEventListener("submit", async (event) => {
      event.preventDefault();

      const description = document.getElementById("description").value;
      const lat = document.getElementById("lat").value;
      const lon = document.getElementById("lon").value;
      const canvas = document.getElementById("cameraCanvas");

      const selectedFile = photoInput.files[0];
      const maxSize = 1 * 1024 * 1024;

      if (selectedFile && selectedFile.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "Ukuran file terlalu besar",
          text: "Silakan pilih foto dengan ukuran maksimal 1 MB."
        });
        return;
      }

      let photoBlob = selectedFile;

      const isCanvasUsed = canvas && canvas.width > 0 && canvas.height > 0;

      if (!photoBlob && this.#cameraCaptured) {
        photoBlob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg")
        );
      }

      if (!photoBlob) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Silakan pilih foto atau ambil gambar menggunakan kamera."
        });
        return;
      }

      if (!lat || !lon) {
        Swal.fire({
          icon: "error",
          title: "Lokasi belum dipilih",
          text: "Silakan klik pada peta untuk memilih lokasi."
        });
        return;
      }

      await this.#presenter.addStory({
        description,
        lat: Number(lat),
        lon: Number(lon),
        photo: photoBlob
      });
    });
  }

  #setupCamera() {
    const startCameraBtn = document.getElementById("startCameraBtn");
    const cameraPreview = document.getElementById("cameraPreview");
    const captureBtn = document.getElementById("captureBtn");
    const cameraCanvas = document.getElementById("cameraCanvas");
    const descriptionWrapper = document.getElementById("descriptionWrapper");

    startCameraBtn.addEventListener("click", async () => {
      const stream = await initCamera(cameraPreview);
      if (stream) {
        this.#camera = stream;
        cameraPreview.style.display = "block";
        cameraCanvas.style.display = "none";
        captureBtn.style.display = "inline-block";
        descriptionWrapper.style.display = "none";
      } else {
        console.error("Kamera gagal diinisialisasi.");
      }
    });

    captureBtn.addEventListener("click", () => {
      if (!this.#camera) {
        console.error("Kamera tidak aktif.");
        return;
      }

      const context = cameraCanvas.getContext("2d");
      cameraCanvas.width = cameraPreview.videoWidth;
      cameraCanvas.height = cameraPreview.videoHeight;

      context.drawImage(
        cameraPreview,
        0,
        0,
        cameraCanvas.width,
        cameraCanvas.height
      );

      this.#cameraCaptured = true;

      stopCamera(cameraPreview);
      this.#camera = null;

      cameraPreview.style.display = "none";
      cameraCanvas.style.display = "block";
      descriptionWrapper.style.display = "block";
      captureBtn.style.display = "none";
      startCameraBtn.style.display = "inline-block";
    });
  }

  setCoordinates(lat, lon) {
    document.getElementById("lat").value = lat;
    document.getElementById("lon").value = lon;
  }

  showSuccess(message) {
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: message || "Cerita berhasil ditambahkan!"
    }).then(() => {
      location.hash = "/home";
    });
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: message || "Terjadi kesalahan saat menambahkan cerita."
    });
  }

  showLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("loading-overlay").style.display = "none";
  }
}
