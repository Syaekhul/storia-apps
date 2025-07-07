import * as StorieAPI from "../../data/api";
import L from "leaflet";

export default class AddPresenter {
  #view;
  #model;
  #map = null;
  #marker = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initiateMap() {
    this.#map = L.map("map").setView([-7.005145, 110.438125], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    this.#map.on("click", (e) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      this.#view.setCoordinates(lat, lon);

      if (this.#marker) {
        this.#map.removeLayer(this.#marker);
      }

      this.#marker = L.marker([lat, lon])
        .addTo(this.#map)
        .bindPopup("Lokasi dipilih")
        .openPopup();
    });
  }

  async addStory({ photo, description, lat, lon }) {
    this.#view.showLoading();
    try {
      const data = {
        photo: photo,
        description: description,
        lat: lat,
        lon: lon
      };
      const response = await this.#model.addStory(data);

      if (response.error) {
        this.#view.showError(response.message);
      } else {
        this.#view.showSuccess("Cerita berhasil ditambahkan!");
      }
    } catch (error) {
      this.#view.showError("Terjadi kesalahan saat menambahkan cerita.");
    } finally {
      this.#view.hideLoading();
    }
  }
}
