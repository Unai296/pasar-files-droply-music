# 🎵 Spotifyme — Tu Spotify Personal

## Estructura de archivos

```
spotify/
├── index.html          ← Abrir este archivo en el navegador
├── css/
│   ├── reset.css
│   ├── variables.css   ← Colores y variables
│   ├── layout.css      ← Grid principal
│   ├── sidebar.css     ← Sidebar izquierda
│   ├── main.css        ← Contenido principal
│   ├── player.css      ← Barra del reproductor
│   ├── modal.css       ← Modal crear playlist
│   └── animations.css  ← Animaciones
├── js/
│   ├── data.js         ← ⭐ TUS CANCIONES AQUÍ
│   ├── state.js        ← Estado de la app
│   ├── player.js       ← Motor de audio
│   ├── ui.js           ← Componentes UI
│   ├── views.js        ← Vistas y navegación
│   ├── search.js       ← Búsqueda
│   ├── playlists.js    ← Gestión de playlists
│   └── app.js          ← Punto de entrada
└── Music/
    └── barbiedeextraradio.mp3   ← TUS ARCHIVOS MP3 AQUÍ
```

## ⭐ Cómo añadir canciones

Edita `js/data.js` y añade objetos al array `SONGS`:



## 🎵 Cómo obtener portadas de Spotify

1. Ve a Spotify Web y busca la canción
2. Clic derecho en la portada → "Copiar enlace de imagen"
3. Pega la URL en el campo `cover`

## 🚀 Cómo usar

1. Coloca tus archivos `.mp3` en la carpeta `Music/`
2. Añade las canciones en `js/data.js`
3. Abre `index.html` en el navegador
   - **Recomendado**: usa un servidor local para evitar problemas con CORS:
     ```bash
     python3 -m http.server 8080
     # o
     npx serve .
     ```
   - Luego abre `http://localhost:8080`

## ⌨️ Atajos de teclado

- `Espacio` — Reproducir / Pausar
- `Alt + →` — Siguiente canción
- `Alt + ←` — Canción anterior
- `Clic derecho` en canción — Menú de opciones

## ✨ Funcionalidades

- ✅ Reproductor completo con barra de progreso
- ✅ Control de volumen
- ✅ Shuffle (aleatorio) y Repeat (repetición)
- ✅ Me gusta (♥) con persistencia
- ✅ Crear playlists con nombre, descripción y foto
- ✅ Añadir canciones a playlists (clic derecho)
- ✅ Búsqueda en tiempo real
- ✅ Filtro por categorías
- ✅ Vista de artistas
- ✅ Menú contextual
- ✅ Panel "Now Playing"
- ✅ Navegación historial (adelante/atrás)
- ✅ Atajos de teclado
- ✅ Persistencia en localStorage
