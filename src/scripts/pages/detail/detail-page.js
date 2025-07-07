import DetailPresenter from "./detail-presenter";
import * as StorieAPI from "../../data/api";
import { parseActivePathname } from "../../routes/url-parser";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default class DetailPage {
  #presenter = null;
  #map = null;
  #fallbackMapData = {
    lat: -6.2,
    lon: 106.8,
    name: "Default Location"
  };

  async render() {
    return `
      <section class="detail-container">
        <h1 class="title">Detail Story</h1>
        <div id="story-detail" class="story-detail"></div>
        <div id="map" class="map"></div>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
    const { id } = parseActivePathname();

    this.#presenter = new DetailPresenter({
      view: this,
      model: StorieAPI
    });

    try {
      await this.#presenter.getDetailStory(id);
    } catch (error) {
      console.error("Failed to load story detail:", error);
      this.#tryToLoadFromCache(id);
    }
  }

  async #tryToLoadFromCache(id) {
    try {
      const story = await import("../../data/database").then((m) =>
        m.default.getStoryById(id)
      );
      if (story) {
        this.showDetailStory(story);
        return;
      }

      this.showError("Anda sedang offline. Detail story tidak tersedia.");

      this.#showMap(
        this.#fallbackMapData.lat,
        this.#fallbackMapData.lon,
        this.#fallbackMapData.name
      );
    } catch (error) {
      console.error("Failed to load from IndexedDB:", error);
      this.showError("Gagal memuat detail cerita. Silakan coba lagi nanti.");
    }
  }

  showDetailStory(story) {
    const container = document.getElementById("story-detail");
    const formattedDate = new Date(story.createdAt)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    container.innerHTML = `
      <article class="detail-story-card">
        <figure>
          <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" 
               onerror="this.onerror=null; this.src='/images/logo.png';" />
          <figcaption>${story.name}</figcaption>
        </figure>
          <h2>${story.name}</h2>
          <p>${story.description}</p>
          <small>Diposting pada: <time datetime="${story.createdAt}">${formattedDate}</time></small><br>
          <small>Lokasi: ${story.lat}, ${story.lon}</small>
      </article>
    `;

    this.#showMap(story.lat, story.lon, story.name);
  }

  showError(message) {
    document.getElementById("story-detail").innerHTML = `
      <div class="error-message">
        <p>${message}</p>
      </div>
    `;
  }

  #showMap(lat, lon, name) {
    try {
      if (this.#map) {
        this.#map.remove();
        this.#map = null;
      }

      const mapElement = document.getElementById("map");
      if (!mapElement) return;

      this.#map = L.map("map").setView([lat, lon], 13);

      const openStreetMap = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      );

      const cartoLight = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          maxZoom: 20,
          attribution: '&copy; <a href="https://carto.com/">CartoDB</a>'
        }
      );

      const esriSatellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 20,
          attribution: "Tiles &copy; Esri"
        }
      );

      openStreetMap.addTo(this.#map);

      L.marker([lat, lon])
        .addTo(this.#map)
        .bindPopup(`<b>${name}</b><br>Lokasi cerita.`)
        .openPopup();

      const baseLayers = {
        OpenStreetMap: openStreetMap,
        "CartoDB Light": cartoLight,
        "Esri Satellite": esriSatellite
      };

      L.control.layers(baseLayers).addTo(this.#map);

      setTimeout(() => {
        if (this.#map) {
          this.#map.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error("Error rendering map:", error);
      const mapElement = document.getElementById("map");
      if (mapElement) {
        mapElement.innerHTML = `
          <div class="map-error">
            <p>Tidak dapat menampilkan peta. Anda mungkin sedang offline.</p>
          </div>
        `;
      }
    }
  }

  showLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("loading-overlay").style.display = "none";
  }
}
