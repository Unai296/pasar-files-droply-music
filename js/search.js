// ============================================================
//  SEARCH - Búsqueda en tiempo real
// ============================================================

const Search = {
  _debounce: null,

  init() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', () => {
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => this.query(input.value.trim()), 200);
    });
  },

  query(q) {
    const resultsDiv = document.getElementById('searchResults');
    const list       = document.getElementById('searchTrackList');
    const catGrid    = document.getElementById('categoriesGrid');

    if (!q) {
      resultsDiv.style.display = 'none';
      catGrid.style.display    = 'grid';
      return;
    }

    const ql = q.toLowerCase();
    const results = SONGS.filter(s =>
      s.title.toLowerCase().includes(ql)  ||
      s.artist.toLowerCase().includes(ql) ||
      (s.category || '').toLowerCase().includes(ql)
    );

    catGrid.style.display    = 'none';
    resultsDiv.style.display = 'block';
    list.innerHTML = '';

    if (results.length === 0) {
      list.innerHTML = `<p style="color:var(--text-subdued);padding:32px 0;text-align:center;">
        No se encontraron resultados para "<strong>${q}</strong>"</p>`;
      return;
    }

    results.forEach((song, i) => {
      list.appendChild(UI.createTrackRow(song, i, results, true, i + 1));
    });
  },

  filterByCategory(cat) {
    Views.show('search');
    const input = document.getElementById('searchInput');
    input.value = cat;
    this.query(cat);
    setTimeout(() => input.focus(), 100);
  }
};
