// ============================================================
//  PLAYER - Motor de reproducción de audio
// ============================================================

const audio = document.getElementById('audioPlayer');

const Player = {
  _progressDragging: false,
  _volumeDragging:   false,

  init() {
    audio.volume = State.volume;
    this.bindEvents();
    this.updateVolumeUI();
    this.setupMediaSession();
  },

  bindEvents() {
    // Audio events
    audio.addEventListener('timeupdate',  () => this.onTimeUpdate());
    audio.addEventListener('ended',       () => this.onEnded());
    audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
    audio.addEventListener('error',       () => this.onError());
    audio.addEventListener('play',        () => this.onPlayState(true));
    audio.addEventListener('pause',       () => this.onPlayState(false));

    // Controls
    document.getElementById('btnPlayPause').addEventListener('click', () => this.togglePlay());
    document.getElementById('btnPrev').addEventListener('click',      () => this.prev());
    document.getElementById('btnNext').addEventListener('click',      () => this.next());

    const btnShuffle = document.getElementById('btnShuffle');
    if (btnShuffle) btnShuffle.addEventListener('click', () => this.toggleShuffle());
    const btnRepeat = document.getElementById('btnRepeat');
    if (btnRepeat) btnRepeat.addEventListener('click', () => this.toggleRepeat());

    const fsBtnPrev = document.getElementById('npFsPrev');
    const fsBtnNext = document.getElementById('npFsNext');
    const fsBtnPlayPause = document.getElementById('npFsPlayPause');
    const fsBtnShuffle = document.getElementById('npFsShuffle');
    const fsBtnRepeat = document.getElementById('npFsRepeat');
    const fsHeart = document.getElementById('npFsHeart');
    const fsClose = document.getElementById('npFsClose');
    const fsVolTrack = document.getElementById('npFsVolTrack');
    const fsProgress = document.getElementById('npFsProgressBar');

    if (fsBtnPrev) fsBtnPrev.addEventListener('click', () => this.prev());
    if (fsBtnNext) fsBtnNext.addEventListener('click', () => this.next());
    if (fsBtnPlayPause) fsBtnPlayPause.addEventListener('click', () => this.togglePlay());
    if (fsBtnShuffle) fsBtnShuffle.addEventListener('click', () => this.toggleShuffle());
    if (fsBtnRepeat) fsBtnRepeat.addEventListener('click', () => this.toggleRepeat());
    if (fsHeart) fsHeart.addEventListener('click', () => {
      if (!State.currentSong) return;
      const idx = SONGS.indexOf(State.currentSong);
      const liked = State.likeSong(idx);
      this.updateHearts(idx, liked);
      State.saveToStorage();
      showToast(liked ? '❤️ Añadido a canciones que te gustan' : 'Eliminado de canciones que te gustan');
      UI.refreshLikedView();
      UI.updateFullscreen(State.currentSong);
    });
    if (fsClose) fsClose.addEventListener('click', () => UI.hideFullscreenNowPlaying());
    if (fsVolTrack) fsVolTrack.addEventListener('click', (e) => this.seekVolume(e, fsVolTrack));
    if (fsProgress) fsProgress.addEventListener('click', (e) => this.seekTo(e, fsProgress));

    const playerTap = document.getElementById('playerLeftTap');
    if (playerTap) playerTap.addEventListener('click', () => {
      if (State.currentSong) UI.showFullscreenNowPlaying();
    });

    // Progress bar
    const pw = document.getElementById('progressBarWrapper');
    if (pw) {
      pw.addEventListener('click', (e) => this.seekTo(e, pw));
      pw.addEventListener('mousedown', () => { this._progressDragging = true; });
      document.addEventListener('mousemove', (e) => {
        if (this._progressDragging) this.seekTo(e, pw);
      });
      document.addEventListener('mouseup', () => { this._progressDragging = false; });
    }

    // Volume
    const vs = document.getElementById('volumeSlider');
    if (vs) vs.addEventListener('input', () => this.setVolume(vs.value / 100));

    const vw = document.querySelector('.volume-slider-wrapper');
    if (vw) vw.addEventListener('click', (e) => this.seekVolume(e, vw));

    // Hearts
    const playerHeart = document.getElementById('playerHeart');
    if (playerHeart) {
      playerHeart.addEventListener('click', () => {
        if (State.currentSong) {
          const idx = SONGS.indexOf(State.currentSong);
          const liked = State.likeSong(idx);
          this.updateHearts(idx, liked);
          State.saveToStorage();
          showToast(liked ? '❤️ Añadido a canciones que te gustan' : 'Eliminado de canciones que te gustan');
          UI.refreshLikedView();
        }
      });
    }

    const npHeart = document.getElementById('npHeart');
    if (npHeart) {
      npHeart.addEventListener('click', () => {
        const playerHeartBtn = document.getElementById('playerHeart');
        if (playerHeartBtn) playerHeartBtn.click();
      });
    }

    // Now playing toggle
    const btnNowPlaying = document.getElementById('btnNowPlaying');
    if (btnNowPlaying) btnNowPlaying.addEventListener('click', () => {
      UI.toggleNowPlaying();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); this.togglePlay(); }
      if (e.code === 'ArrowRight' && e.altKey) this.next();
      if (e.code === 'ArrowLeft'  && e.altKey) this.prev();
    });
  },

  play(song, queue, index) {
    if (song === State.currentSong && State.isPlaying) {
      this.pause();
      return;
    }

    State.currentSong  = song;
    State.currentQueue = queue || [song];
    State.currentIndex = index !== undefined ? index : 0;

    audio.src = song.file;
    audio.load();
    audio.play().catch(() => {
      showToast('⚠️ No se pudo cargar el archivo de audio');
    });

    this.updatePlayerUI(song);
    this.updateMediaSessionMetadata(song);
    UI.updateNowPlaying(song);
    UI.highlightCurrentTrack();
  },

  pause() {
    audio.pause();
  },

  togglePlay() {
    if (!State.currentSong) return;
    if (audio.paused) audio.play();
    else audio.pause();
  },

  prev() {
    if (!State.currentQueue.length) return;
    let idx = State.currentIndex - 1;
    if (idx < 0) idx = State.currentQueue.length - 1;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    State.currentIndex = idx;
    this.play(State.currentQueue[idx], State.currentQueue, idx);
  },

  next() {
    if (!State.currentQueue.length) return;
    let idx;
    if (State.shuffle) {
      idx = Math.floor(Math.random() * State.currentQueue.length);
    } else {
      idx = State.currentIndex + 1;
      if (idx >= State.currentQueue.length) idx = 0;
    }
    State.currentIndex = idx;
    this.play(State.currentQueue[idx], State.currentQueue, idx);
  },

  onEnded() {
    if (State.repeat === 'one') {
      audio.currentTime = 0;
      audio.play();
    } else {
      this.next();
    }
  },

  toggleShuffle() {
    State.shuffle = !State.shuffle;
    const btn = document.getElementById('btnShuffle');
    const fsBtn = document.getElementById('npFsShuffle');
    if (btn) btn.classList.toggle('active', State.shuffle);
    if (fsBtn) fsBtn.classList.toggle('active', State.shuffle);
    showToast(State.shuffle ? '🔀 Aleatorio activado' : 'Aleatorio desactivado');
  },

  toggleRepeat() {
    const modes = ['none', 'all', 'one'];
    const curr = modes.indexOf(State.repeat);
    State.repeat = modes[(curr + 1) % modes.length];
    const btn = document.getElementById('btnRepeat');
    const fsBtn = document.getElementById('npFsRepeat');
    if (btn) btn.classList.remove('active');
    if (fsBtn) fsBtn.classList.remove('active');
    if (State.repeat !== 'none') {
      if (btn) btn.classList.add('active');
      if (fsBtn) fsBtn.classList.add('active');
    }
    const labels = { none: 'Repetición desactivada', all: '🔁 Repetir todo', one: '🔂 Repetir una' };
    showToast(labels[State.repeat]);
  },

  seekTo(e, wrapper) {
    if (!audio.duration) return;
    const rect = wrapper.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  },

  setVolume(v) {
    State.volume = Math.max(0, Math.min(1, v));
    audio.volume = State.volume;
    this.updateVolumeUI();
    State.saveToStorage();
  },

  seekVolume(e, wrapper) {
    const rect = wrapper.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.setVolume(ratio);
    document.getElementById('volumeSlider').value = ratio * 100;
  },

  onTimeUpdate() {
    if (!audio.duration || this._progressDragging) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    const fill  = document.getElementById('progressFill');
    const thumb = document.getElementById('progressThumb');
    const fsFill  = document.getElementById('npFsProgressFill');
    const fsThumb = document.getElementById('npFsProgressThumb');
    const fsCurrent = document.getElementById('npFsCurrentTime');
    if (fill)   fill.style.width = pct + '%';
    if (thumb)  thumb.style.left = pct + '%';
    if (fsFill) fsFill.style.width = pct + '%';
    if (fsThumb) fsThumb.style.left = pct + '%';
    document.getElementById('currentTime').textContent = secondsToStr(audio.currentTime);
    if (fsCurrent) fsCurrent.textContent = secondsToStr(audio.currentTime);
  },

  onMetadataLoaded() {
    const total = secondsToStr(audio.duration);
    const totalTime = document.getElementById('totalTime');
    const fsTotal = document.getElementById('npFsTotalTime');
    if (totalTime) totalTime.textContent = total;
    if (fsTotal) fsTotal.textContent = total;
  },

  onPlayState(playing) {
    State.isPlaying = playing;
    const iconPlay  = document.getElementById('iconPlay');
    const iconPause = document.getElementById('iconPause');
    const fsIconPlay  = document.getElementById('npFsIconPlay');
    const fsIconPause = document.getElementById('npFsIconPause');
    if (iconPlay && iconPause) {
      iconPlay.style.display  = playing ? 'none'  : 'block';
      iconPause.style.display = playing ? 'block' : 'none';
    }
    if (fsIconPlay && fsIconPause) {
      fsIconPlay.style.display  = playing ? 'none'  : 'block';
      fsIconPause.style.display = playing ? 'block' : 'none';
    }
    const cover = document.getElementById('playerCover');
    const fsCover = document.getElementById('npFsCover');
    if (playing) {
      if (cover) cover.classList.add('spinning');
      if (fsCover) fsCover.classList.add('playing');
    } else {
      if (cover) cover.classList.remove('spinning');
      if (fsCover) fsCover.classList.remove('playing');
    }
    this.updateMediaSessionPlaybackState();
    UI.highlightCurrentTrack();
  },

  onError() {
    showToast('⚠️ Error al cargar el audio. Comprueba que el archivo existe en ./Music/');
  },

  setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play',  () => this.togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => this.togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
    navigator.mediaSession.setActionHandler('nexttrack',     () => this.next());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (!details || details.fastSeek === undefined) return;
      audio.currentTime = details.seekTime;
    });
  },

  updateMediaSessionMetadata(song) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: song.album || 'DROPLY',
      artwork: [
        { src: song.cover || 'img/droply-logo.svg', sizes: '512x512', type: 'image/png' }
      ]
    });
    this.updateMediaSessionPlaybackState();
  },

  updateMediaSessionPlaybackState() {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = State.isPlaying ? 'playing' : 'paused';
  },

  updatePlayerUI(song) {
    document.getElementById('playerCover').src  = song.cover || '';
    document.getElementById('playerTitle').textContent  = song.title;
    document.getElementById('playerArtist').textContent = song.artist;
    document.getElementById('npTitle').textContent      = song.title;
    document.getElementById('npArtist').textContent     = song.artist;
    document.getElementById('npCoverImg').src           = song.cover || '';

    const idx   = SONGS.indexOf(song);
    const liked = State.isLiked(idx);
    this.updateHearts(idx, liked);
    UI.updateFullscreen(song);

    // Total time from data if audio not loaded yet
    if (song.duration) {
      document.getElementById('totalTime').textContent = song.duration;
      const npFsTotal = document.getElementById('npFsTotalTime');
      if (npFsTotal) npFsTotal.textContent = song.duration;
    }

    document.title = `${song.title} • ${song.artist} — DROPLY`;
  },

  updateHearts(idx, liked) {
    const ph = document.getElementById('playerHeart');
    const nh = document.getElementById('npHeart');
    const fsHeart = document.getElementById('npFsHeart');
    if (ph) {
      ph.textContent = liked ? '♥' : '♡';
      ph.classList.toggle('liked', liked);
    }
    if (nh) {
      nh.textContent = liked ? '♥' : '♡';
      nh.classList.toggle('liked', liked);
    }
    if (fsHeart) {
      fsHeart.textContent = liked ? '♥' : '♡';
      fsHeart.classList.toggle('liked', liked);
    }
    // Update track list hearts
    document.querySelectorAll('.track-heart').forEach(btn => {
      if (parseInt(btn.dataset.idx) === idx) {
        btn.textContent = liked ? '♥' : '♡';
        btn.classList.toggle('liked', liked);
      }
    });
  },

  updateVolumeUI() {
    const pct = State.volume * 100;
    const fill = document.getElementById('volumeFill');
    const thumb = document.getElementById('volumeThumb');
    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';
  }
};
