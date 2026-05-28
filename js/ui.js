// ============================================================
//  UI - Helpers de renderizado
// ============================================================

const UI = {
  _nowPlayingVisible: false,

  // ── Tarjeta de canción / artista ──────────────────────────
  createCard(song, queue, index, options = {}) {
    const { rounded = false, subtitle = song.artist } = options;
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-img-wrapper ${rounded ? 'rounded' : ''}">
        <img src="${song.cover || ''}" alt="${song.title}" loading="lazy"
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23282828%22/></svg>'"/>
        <button class="card-play-btn">▶</button>
      </div>
      <div class="card-title">${song.title}</div>
      <div class="card-sub">${subtitle}</div>
    `;
    div.querySelector('.card-play-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      Player.play(song, queue || SONGS, index !== undefined ? index : SONGS.indexOf(song));
    });
    div.addEventListener('click', () => {
      Player.play(song, queue || SONGS, index !== undefined ? index : SONGS.indexOf(song));
    });
    return div;
  },

  // ── Track row ─────────────────────────────────────────────
  createTrackRow(song, idx, queue, showAlbum = false, num = null) {
    const songIdx = SONGS.indexOf(song);
    const liked   = State.isLiked(songIdx);
    const row = document.createElement('div');
    row.className = 'track-item';
    row.dataset.songIdx = songIdx;

    const displayNum = num !== null ? num : idx + 1;
    row.innerHTML = `
      <div class="track-number">
        <span class="num">${displayNum}</span>
        <span class="play-icon">▶</span>
      </div>
      <div class="track-info">
        <img src="${song.cover || ''}" alt="" loading="lazy"
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22><rect fill=%22%23282828%22/></svg>'"/>
        <div class="track-text">
          <div class="track-name">${song.title}</div>
          <div class="track-artist-name">${song.artist}</div>
        </div>
      </div>
      <div class="track-album">${showAlbum ? (song.category || '') : ''}</div>
      <div class="track-actions">
        <button class="track-heart ${liked ? 'liked' : ''}" data-idx="${songIdx}">${liked ? '♥' : '♡'}</button>
      </div>
      <div class="track-duration">${song.duration || '—'}</div>
    `;

    // Click play
    row.addEventListener('click', (e) => {
      if (e.target.classList.contains('track-heart')) return;
      Player.play(song, queue, idx);
    });

    // Heart
    row.querySelector('.track-heart').addEventListener('click', (e) => {
      e.stopPropagation();
      const liked = State.likeSong(songIdx);
      e.target.textContent = liked ? '♥' : '♡';
      e.target.classList.toggle('liked', liked);
      if (State.currentSong === song) Player.updateHearts(songIdx, liked);
      State.saveToStorage();
      showToast(liked ? '❤️ Añadido a canciones que te gustan' : 'Eliminado de canciones que te gustan');
      this.refreshLikedView();
    });

    // Context menu
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, song, songIdx);
    });

    return row;
  },

  // ── Pick item (grilla de inicio) ─────────────────────────
  createPickItem(song, queue, index) {
    const div = document.createElement('div');
    div.className = 'pick-item';
    div.innerHTML = `
      <img src="${song.cover || ''}" alt="${song.title}" loading="lazy"/>
      <span>${song.title}</span>
      <button class="pick-play-btn">▶</button>
    `;
    div.addEventListener('click', () => Player.play(song, queue, index));
    return div;
  },

  // ── Highlight current track ───────────────────────────────
  highlightCurrentTrack() {
    document.querySelectorAll('.track-item').forEach(row => {
      const isPlaying = parseInt(row.dataset.songIdx) === SONGS.indexOf(State.currentSong)
                        && State.isPlaying;
      row.classList.toggle('playing', parseInt(row.dataset.songIdx) === SONGS.indexOf(State.currentSong));
    });
  },

  // ── Now Playing bar ───────────────────────────────────────
  toggleNowPlaying() {
    this._nowPlayingVisible = !this._nowPlayingVisible;
    const npBar = document.getElementById('nowPlayingBar');
    const app   = document.getElementById('app');
    if (npBar) npBar.classList.toggle('open', this._nowPlayingVisible);
    if (app) app.classList.toggle('now-playing-open', this._nowPlayingVisible);
    const btn = document.getElementById('btnNowPlaying');
    if (btn) btn.classList.toggle('active', this._nowPlayingVisible);
  },

  showFullscreenNowPlaying() {
    const fs = document.getElementById('nowPlayingFullscreen');
    if (!fs) return;
    fs.classList.add('open');
  },

  hideFullscreenNowPlaying() {
    const fs = document.getElementById('nowPlayingFullscreen');
    if (!fs) return;
    fs.classList.remove('open');
  },

  updateNowPlaying(song) {
    document.getElementById('npTitle').textContent  = song.title;
    document.getElementById('npArtist').textContent = song.artist;
    document.getElementById('npCoverImg').src        = song.cover || '';
    const idx   = SONGS.indexOf(song);
    const liked = State.isLiked(idx);
    const nh    = document.getElementById('npHeart');
    nh.textContent = liked ? '♥' : '♡';
    nh.classList.toggle('liked', liked);
    this.updateFullscreen(song);
  },

  updateFullscreen(song) {
    document.getElementById('npFsTitle').textContent  = song.title;
    document.getElementById('npFsArtist').textContent = song.artist;
    document.getElementById('npFsCover').src          = song.cover || '';
    document.getElementById('npFsBg').style.backgroundImage = song.cover ? `url('${song.cover}')` : 'none';
    const idx   = SONGS.indexOf(song);
    const liked = State.isLiked(idx);
    const heart = document.getElementById('npFsHeart');
    heart.textContent = liked ? '♥' : '♡';
    heart.classList.toggle('liked', liked);
  },

  // ── Refresh liked view ────────────────────────────────────
  refreshLikedView() {
    const list  = document.getElementById('likedTrackList');
    const count = document.getElementById('likedCount');
    const songs = State.getLikedSongs();
    count.textContent = `${songs.length} canción${songs.length !== 1 ? 'es' : ''}`;
    list.innerHTML = '';
    if (songs.length === 0) {
      list.innerHTML = '<p style="color:var(--text-subdued);padding:24px 0;">Aún no tienes canciones guardadas.</p>';
      return;
    }
    songs.forEach((song, i) => {
      list.appendChild(this.createTrackRow(song, i, songs, true, i + 1));
    });
  }
};

// ── Toast ──────────────────────────────────────────────────
let _toastTimer = null;
function showToast(msg, duration = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

// ── Context menu ──────────────────────────────────────────
let _ctxMenu = null;
function showContextMenu(x, y, song, songIdx) {
  removeContextMenu();
  const menu = document.createElement('div');
  menu.className = 'context-menu';

  const liked = State.isLiked(songIdx);

  const items = [
    {
      label: liked ? '✕ Quitar de Me gusta' : '♥ Guardar en Me gusta',
      action: () => {
        const l = State.likeSong(songIdx);
        showToast(l ? '❤️ Añadido a canciones que te gustan' : 'Eliminado de canciones que te gustan');
        State.saveToStorage();
        UI.refreshLikedView();
        if (State.currentSong === song) Player.updateHearts(songIdx, l);
        document.querySelectorAll(`.track-heart[data-idx="${songIdx}"]`).forEach(b => {
          b.textContent = l ? '♥' : '♡'; b.classList.toggle('liked', l);
        });
      }
    },
    { divider: true },
    ...State.playlists.map(pl => ({
      label: `➕ Añadir a "${pl.name}"`,
      action: () => {
        const added = State.addToPlaylist(pl.id, songIdx);
        showToast(added ? `Añadido a "${pl.name}"` : `Ya está en "${pl.name}"`);
        Views.renderSidebar();
      }
    })),
    { divider: true },
    {
      label: `🎤 Ver artista: ${song.artist}`,
      action: () => Views.showArtist(song.artist)
    },
    {
      label: `▶ Reproducir siguiente`,
      action: () => {
        State.currentQueue.splice(State.currentIndex + 1, 0, song);
        showToast('Reproducir siguiente');
      }
    }
  ];

  items.forEach(item => {
    if (item.divider) {
      const d = document.createElement('div');
      d.className = 'context-menu-divider';
      menu.appendChild(d);
      return;
    }
    const el = document.createElement('div');
    el.className = 'context-menu-item';
    el.textContent = item.label;
    el.addEventListener('click', () => { item.action(); removeContextMenu(); });
    menu.appendChild(el);
  });

  // Position
  menu.style.left = Math.min(x, window.innerWidth - 220) + 'px';
  menu.style.top  = Math.min(y, window.innerHeight - menu.offsetHeight - 20) + 'px';
  document.body.appendChild(menu);
  _ctxMenu = menu;

  // Fix position after mount
  requestAnimationFrame(() => {
    menu.style.top = Math.min(y, window.innerHeight - menu.offsetHeight - 20) + 'px';
  });
}

function removeContextMenu() {
  if (_ctxMenu) { _ctxMenu.remove(); _ctxMenu = null; }
}
document.addEventListener('click', removeContextMenu);
document.addEventListener('scroll', removeContextMenu, true);
