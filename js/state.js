// ============================================================
//  STATE - Estado global de la aplicación
// ============================================================

const State = {
  // Reproducción
  currentSong:   null,   // objeto canción actual
  currentQueue:  [],     // lista actual
  currentIndex:  -1,     // índice en la cola
  isPlaying:     false,
  shuffle:       false,
  repeat:        'none', // 'none' | 'all' | 'one'
  volume:        0.8,

  // UI
  currentView:   'home',
  libraryFilter: 'playlists',
  likedSongs:    new Set(),  // índices de canciones
  playlists:     [],         // playlists del usuario
  viewHistory:   [],
  viewFuture:    [],
  currentPlaylistId: null,
  currentArtist: null,

  // Métodos
  likeSong(idx) {
    if (this.likedSongs.has(idx)) {
      this.likedSongs.delete(idx);
      return false;
    } else {
      this.likedSongs.add(idx);
      return true;
    }
  },

  isLiked(idx) {
    return this.likedSongs.has(idx);
  },

  getLikedSongs() {
    return [...this.likedSongs].map(i => SONGS[i]).filter(Boolean);
  },

  saveToStorage() {
    try {
      localStorage.setItem('droply_liked', JSON.stringify([...this.likedSongs]));
      localStorage.setItem('droply_playlists', JSON.stringify(this.playlists));
      localStorage.setItem('droply_volume', this.volume);
    } catch(e) {}
  },

  loadFromStorage() {
    try {
      const likedRaw = localStorage.getItem('droply_liked') || localStorage.getItem('spotifyme_liked') || '[]';
      const plsRaw   = localStorage.getItem('droply_playlists') || localStorage.getItem('spotifyme_playlists') || '[]';
      const volRaw   = localStorage.getItem('droply_volume') || localStorage.getItem('spotifyme_volume');
      const liked = JSON.parse(likedRaw || '[]');
      this.likedSongs = new Set(liked);
      this.playlists = JSON.parse(plsRaw || '[]');
      if (volRaw !== null) this.volume = parseFloat(volRaw);
    } catch(e) {
      this.playlists = [];
    }
  },

  createPlaylist(name, desc, cover) {
    const pl = {
      id: 'pl_' + Date.now(),
      name: name || 'Mi playlist',
      description: desc || '',
      cover: cover || '',
      songs: [],
      createdAt: Date.now()
    };
    this.playlists.push(pl);
    this.saveToStorage();
    return pl;
  },

  addToPlaylist(playlistId, songIdx) {
    const pl = this.playlists.find(p => p.id === playlistId);
    if (pl && !pl.songs.includes(songIdx)) {
      pl.songs.push(songIdx);
      this.saveToStorage();
      return true;
    }
    return false;
  },

  removeFromPlaylist(playlistId, songIdx) {
    const pl = this.playlists.find(p => p.id === playlistId);
    if (pl) {
      pl.songs = pl.songs.filter(i => i !== songIdx);
      this.saveToStorage();
    }
  },

  getPlaylist(id) {
    return this.playlists.find(p => p.id === id) || null;
  }
};
