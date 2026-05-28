// ============================================================
//  APP - Punto de entrada principal
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. Cargar estado guardado
  State.loadFromStorage();

  // 2. Inicializar módulos
  Player.init();
  Search.init();
  Playlists.init();

  // 3. Renderizar vistas iniciales
  Views.renderHome();
  Views.renderSearch();
  Views.renderLibrary();
  Views.renderLiked();
  Views.renderSidebar();

  // 4. Mostrar inicio
  Views.show('home', false);

  // 5. Nav items
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      if (view === 'home') {
        Views.renderHome();
        Views.show('home');
      } else if (view === 'search') {
        Views.show('search');
        setTimeout(() => document.getElementById('searchInput').focus(), 200);
      } else if (view === 'library') {
        Views.renderLibrary();
        Views.show('library');
      }
    });
  });

  const btnLiked = document.getElementById('libFilterLiked');
  const btnPls   = document.getElementById('libFilterPlaylists');
  if (btnLiked) btnLiked.addEventListener('click', () => {
    State.libraryFilter = 'liked';
    Views.renderLibrary();
  });
  if (btnPls) btnPls.addEventListener('click', () => {
    State.libraryFilter = 'playlists';
    Views.renderLibrary();
  });

  const likedSongsBtn = document.querySelector('.liked-songs-btn');
  if (likedSongsBtn) {
    likedSongsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Views.renderLiked();
      Views.show('liked');
    });
  }

  // 6. Back / Forward
  document.getElementById('btnBack').addEventListener('click', () => Views.goBack());
  document.getElementById('btnForward').addEventListener('click', () => Views.goForward());

  // 7. Topbar scroll effect
  const container = document.querySelector('.views-container');
  const topbar    = document.querySelector('.topbar');
  container.addEventListener('scroll', () => {
    topbar.classList.toggle('scrolled', container.scrollTop > 60);
  });

  // 8. Player artist/title click → va al artista
  document.getElementById('playerTitle').addEventListener('click', () => {
    if (State.currentSong) {
      // No hacemos nada especial, la canción es la misma
    }
  });
  document.getElementById('playerArtist').addEventListener('click', () => {
    if (State.currentSong) {
      Views.showArtist(State.currentSong.artist);
    }
  });

  // 9. Si no hay canciones, mostrar mensaje
  if (SONGS.length === 0) {
    setTimeout(() => {
      showToast('⚠️ No hay canciones. Añade canciones en js/data.js', 5000);
    }, 1000);
  } else {
    // Preseleccionar primera canción en la UI (sin reproducir)
    const first = SONGS[0];
    document.getElementById('playerTitle').textContent  = first.title;
    document.getElementById('playerArtist').textContent = first.artist;
    document.getElementById('playerCover').src          = first.cover || '';
    document.getElementById('totalTime').textContent    = first.duration || '0:00';
  }

  // 10. Mini-animación de carga
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });

  console.log(`
  ╔═══════════════════════════════════╗
  ║       🎵 DROPLY v1.0             ║
  ║  Añade canciones en js/data.js   ║
  ║  Coloca los MP3 en ./Music/      ║
  ╚═══════════════════════════════════╝
  `);
});

  // Biblioteca: se maneja desde el init principal.
