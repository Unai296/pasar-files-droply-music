// ============================================================
//  VIEWS - Renderiza cada sección
// ============================================================

const Views = {

  // ── Navegación ───────────────────────────────────────────
  show(viewId, pushHistory = true) {
    if (pushHistory && State.currentView !== viewId) {
      State.viewHistory.push(State.currentView);
      State.viewFuture = [];
    }
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById('view-' + viewId);
    if (el) { el.classList.add('active'); State.currentView = viewId; }

    // Update nav
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(a => {
      a.classList.toggle('active', a.dataset.view === viewId);
    });

    // Show/hide search bar
    const searchBar = document.getElementById('searchBar');
    searchBar.style.display = viewId === 'search' ? 'flex' : 'none';

    // Scroll top
    document.querySelector('.views-container').scrollTop = 0;

    // Gradient color per view
    const main = document.getElementById('mainContent');
    const colors = {
      home:     '#1a1a2e',
      search:   '#121212',
      library:  '#121212',
      liked:    '#4b4bff',
      playlist: '#1db954',
      artist:   '#121212'
    };
    const c = colors[viewId] || '#121212';
    main.style.background = `linear-gradient(180deg, ${c}55 0%, var(--bg-base) 35%)`;
  },

  goBack() {
    if (!State.viewHistory.length) return;
    State.viewFuture.push(State.currentView);
    const prev = State.viewHistory.pop();
    this.show(prev, false);
  },

  goForward() {
    if (!State.viewFuture.length) return;
    State.viewHistory.push(State.currentView);
    const next = State.viewFuture.pop();
    this.show(next, false);
  },

  // ── HOME ─────────────────────────────────────────────────
  renderHome() {
    // Greeting
    const h = new Date().getHours();
    const greet = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
    document.getElementById('greeting').textContent = greet;

    // Quick picks (max 8)
    const picksGrid = document.getElementById('picksGrid');
    picksGrid.innerHTML = '';
    const picks = SONGS.slice(0, 8);
    picks.forEach((song, i) => {
      picksGrid.appendChild(UI.createPickItem(song, SONGS, i));
    });

    // Mix del día (todas las canciones en cards)
    const mixCards = document.getElementById('mixCards');
    mixCards.innerHTML = '';
    SONGS.forEach((song, i) => {
      mixCards.appendChild(UI.createCard(song, SONGS, i));
    });

    // Escuchado recientemente (últimas 10 al revés si hay historial, si no las primeras)
    const recentCards = document.getElementById('recentCards');
    recentCards.innerHTML = '';
    const recent = [...SONGS].reverse().slice(0, 10);
    recent.forEach((song) => {
      const i = SONGS.indexOf(song);
      recentCards.appendChild(UI.createCard(song, SONGS, i));
    });

    // Popular tracks
    const popularTracks = document.getElementById('popularTracks');
    popularTracks.innerHTML = '';
    const popularList = SONGS.slice(0, 10);
    popularList.forEach((song, i) => {
      popularTracks.appendChild(UI.createTrackRow(song, i, SONGS, false, i + 1));
    });
  },

  // ── SEARCH ───────────────────────────────────────────────
  renderSearch() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'category-card';
      div.style.background = cat.color;
      div.innerHTML = `
        <h3>${cat.name}</h3>
        <img src="${cat.img}" alt="${cat.name}" loading="lazy"
             onerror="this.style.display='none'"/>
      `;
      div.addEventListener('click', () => Search.filterByCategory(cat.name));
      grid.appendChild(div);
    });
  },

  // ── LIBRARY ───────────────────────────────────────────────
  renderLibrary() {
    const list = document.getElementById('libraryList');
    list.innerHTML = '';
    this.updateLibraryFilterButtons();

    if (State.libraryFilter === 'liked') {
      const songs = State.getLikedSongs();
      if (songs.length === 0) {
        list.innerHTML = '<p style="color:var(--text-subdued);padding:24px 0;">Aún no tienes canciones guardadas. Marca ♥ en tus temas favoritos.</p>';
        return;
      }
      const trackList = document.createElement('div');
      trackList.className = 'track-list';
      songs.forEach((song, i) => {
        trackList.appendChild(UI.createTrackRow(song, i, songs, true, i + 1));
      });
      list.appendChild(trackList);
      return;
    }

    const likedItem = document.createElement('div');
    likedItem.className = 'library-item';
    likedItem.innerHTML = `
      <div class="library-item-cover liked-shortcut">♥</div>
      <div class="library-item-info">
        <div class="library-item-name">Canciones que te gustan</div>
        <div class="library-item-meta">Lista • ${State.getLikedSongs().length} canción${State.getLikedSongs().length !== 1 ? 'es' : ''}</div>
      </div>
    `;
    likedItem.addEventListener('click', () => {
      State.libraryFilter = 'liked';
      this.renderLibrary();
    });
    list.appendChild(likedItem);

    State.playlists.forEach(pl => {
      const el = document.createElement('div');
      el.className = 'library-item';
      el.innerHTML = `
        <img src="${pl.cover || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23282828%22/></svg>'}"
             alt="${pl.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23282828%22/></svg>'"/>
        <div class="library-item-info">
          <div class="library-item-name">${pl.name}</div>
          <div class="library-item-meta">Playlist • ${pl.songs.length} canción${pl.songs.length !== 1 ? 'es' : ''}</div>
        </div>
      `;
      el.addEventListener('click', () => this.showPlaylist(pl.id));
      list.appendChild(el);
    });

    if (State.playlists.length === 0) {
      list.innerHTML = '<p style="color:var(--text-subdued);padding:24px 0;">Tu biblioteca está vacía. Crea una playlist o añade canciones.</p>';
    }
  },

  updateLibraryFilterButtons() {
    const btnLiked = document.getElementById('libFilterLiked');
    const btnPls   = document.getElementById('libFilterPlaylists');
    if (btnLiked) btnLiked.classList.toggle('active', State.libraryFilter === 'liked');
    if (btnPls)   btnPls.classList.toggle('active', State.libraryFilter === 'playlists');
  },

  // ── PLAYLIST DETAIL ───────────────────────────────────────
  showPlaylist(id) {
    const pl = State.getPlaylist(id);
    if (!pl) return;
    State.currentPlaylistId = id;

    document.getElementById('playlistCoverImg').src   = pl.cover || '';
    document.getElementById('playlistTitle').textContent = pl.name;
    document.getElementById('playlistDesc').textContent  = pl.description || '';
    const total = pl.songs.reduce((acc, idx) => {
      const s = SONGS[idx];
      return acc + (s ? durationToSeconds(s.duration) : 0);
    }, 0);
    document.getElementById('playlistMeta').textContent =
      `${pl.songs.length} canciones • ${secondsToStr(total)} en total`;

    const trackList = document.getElementById('playlistTrackList');
    trackList.innerHTML = '';
    const songs = pl.songs.map(i => SONGS[i]).filter(Boolean);

    if (songs.length === 0) {
      trackList.innerHTML = '<p style="color:var(--text-subdued);padding:24px 0;">Esta playlist está vacía. Haz clic derecho en cualquier canción para añadirla.</p>';
    } else {
      songs.forEach((song, i) => {
        trackList.appendChild(UI.createTrackRow(song, i, songs, false, i + 1));
      });
    }

    document.getElementById('playPlaylistBtn').onclick = () => {
      if (songs.length) Player.play(songs[0], songs, 0);
    };
    document.getElementById('shufflePlaylistBtn').onclick = () => {
      Player.toggleShuffle();
      if (songs.length) {
        const ri = Math.floor(Math.random() * songs.length);
        Player.play(songs[ri], songs, ri);
      }
    };

    this.show('playlist');
  },

  // ── ARTIST ───────────────────────────────────────────────
  showArtist(name) {
    const artist = getArtists().find(a => a.name === name);
    if (!artist) return;
    State.currentArtist = name;

    document.getElementById('artistName').textContent = name;
    const header = document.getElementById('artistHeader');
    header.style.backgroundImage = `url('${artist.cover}')`;
    document.getElementById('artistFollowers').textContent =
      `${Math.floor(Math.random() * 5000000 + 100000).toLocaleString('es-ES')} seguidores`;

    const trackList = document.getElementById('artistTrackList');
    trackList.innerHTML = '';
    artist.songs.slice(0, 5).forEach((song, i) => {
      trackList.appendChild(UI.createTrackRow(song, i, artist.songs, false, i + 1));
    });

    const moreCards = document.getElementById('artistMoreCards');
    moreCards.innerHTML = '';
    artist.songs.forEach((song, i) => {
      moreCards.appendChild(UI.createCard(song, artist.songs, i));
    });

    document.getElementById('playArtistBtn').onclick = () => {
      if (artist.songs.length) Player.play(artist.songs[0], artist.songs, 0);
    };

    const followBtn = document.getElementById('followArtistBtn');
    followBtn.classList.remove('following');
    followBtn.textContent = 'Seguir';
    followBtn.onclick = () => {
      followBtn.classList.toggle('following');
      const following = followBtn.classList.contains('following');
      followBtn.textContent = following ? 'Siguiendo' : 'Seguir';
      showToast(following ? `Siguiendo a ${name}` : `Dejaste de seguir a ${name}`);
    };

    this.show('artist');
  },

  // ── LIKED ─────────────────────────────────────────────────
  renderLiked() {
    UI.refreshLikedView();
    document.getElementById('playLikedBtn').onclick = () => {
      const songs = State.getLikedSongs();
      if (songs.length) Player.play(songs[0], songs, 0);
    };
  },

  // ── SIDEBAR ───────────────────────────────────────────────
  renderSidebar() {
    const list = document.getElementById('playlistList');
    list.innerHTML = '';
    State.playlists.forEach(pl => {
      const el = document.createElement('div');
      el.className = 'playlist-sidebar-item';
      el.innerHTML = `
        <img class="playlist-sidebar-img"
             src="${pl.cover || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23282828%22/></svg>'}"
             alt="${pl.name}"
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23282828%22/></svg>'"/>
        <div class="playlist-sidebar-info">
          <div class="playlist-sidebar-name">${pl.name}</div>
          <div class="playlist-sidebar-meta">Playlist</div>
        </div>
      `;
      el.addEventListener('click', () => this.showPlaylist(pl.id));
      list.appendChild(el);
    });
  }
};
