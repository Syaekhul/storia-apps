export default class NotFound {
  async render() {
    return `
            <section class="not-found">
                <h2>404 - Not Found</h2>
                <p>Waduuh Nyasar Kamu le Silahkan kembali ke <a href="#/home" class="btn"> Home.</a></p>
            </section>
        `;
  }

  async afterRender() {
    // Sengaja kosong biar ga error aja di console
  }
}
