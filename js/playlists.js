// ============================================================
//  PLAYLISTS - Crear y gestionar playlists
// ============================================================

const Playlists = {
  init() {
    // Abrir modal
    document.getElementById('createPlaylistBtn').addEventListener('click', () => this.openModal());

    // Cerrar modal
    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modalOverlay')) this.closeModal();
    });

    // Guardar playlist
    document.getElementById('savePlaylistBtn').addEventListener('click', () => this.save());

    // Enter en nombre
    document.getElementById('playlistNameInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.save();
    });

    // Upload cover
    document.getElementById('modalCoverUpload').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const preview = document.getElementById('modalCoverPreview');
          preview.src = ev.target.result;
          preview.style.display = 'block';
          preview.dataset.dataUrl = ev.target.result;
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });

  },

  openModal() {
    document.getElementById('playlistNameInput').value = '';
    document.getElementById('playlistDescInput').value = '';
    document.getElementById('modalCoverPreview').style.display = 'none';
    document.getElementById('modalOverlay').classList.add('open');
    setTimeout(() => document.getElementById('playlistNameInput').focus(), 150);
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  },

  save() {
    const name  = document.getElementById('playlistNameInput').value.trim();
    const desc  = document.getElementById('playlistDescInput').value.trim();
    const preview = document.getElementById('modalCoverPreview');
    const cover = preview.style.display !== 'none' ? preview.dataset.dataUrl : '';

    if (!name) {
      document.getElementById('playlistNameInput').focus();
      showToast('Ponle un nombre a tu playlist');
      return;
    }

    const pl = State.createPlaylist(name, desc, cover);
    this.closeModal();
    showToast(`✅ Playlist "${name}" creada`);
    Views.renderSidebar();
    Views.renderLibrary();
    Views.showPlaylist(pl.id);
  }
};
