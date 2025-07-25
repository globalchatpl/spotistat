const root = document.getElementById('root');
const params = new URLSearchParams(window.location.search);
const accessTokenFromUrl = params.get('access_token');
const refreshTokenFromUrl = params.get('refresh_token');

function clearUrl() {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');

if (accessTokenFromUrl && refreshTokenFromUrl) {
  localStorage.setItem('access_token', accessTokenFromUrl);
  localStorage.setItem('refresh_token', refreshTokenFromUrl);
  accessToken = accessTokenFromUrl;
  refreshToken = refreshTokenFromUrl;
  clearUrl();
}

function renderLoggedIn() {
  root.innerHTML = `
    <div style="padding: 1rem; font-family: 'Roboto', sans-serif; max-width: 768px; margin: auto;">
      <h1 style="font-size: 2rem;">🎧 Twoje TOP 50 utworów</h1>
      <div id="stats" style="margin-top: 1rem; font-size: 1.2rem;"></div>
      <div id="track-list" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;"></div>
      <h2 style="margin-top: 2rem; font-size: 1.8rem;">💿 Najczęściej słuchane albumy</h2>
      <div id="album-list" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;"></div>
      <button id="logout" style="margin-top: 2rem; padding: 0.75rem 1.5rem; font-size: 1rem;">Wyloguj się</button>
    </div>
  `;

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    location.reload();
  });

  fetchTopTracks();
}

function renderLoggedOut() {
  root.innerHTML = `
    <div style="padding: 1rem; font-family: 'Roboto', sans-serif; text-align: center;">
      <h1 style="font-size: 2rem;">🎶 Spotistat</h1>
      <button id="login" style="margin-top: 2rem; padding: 0.75rem 1.5rem; font-size: 1rem;">Zaloguj się przez Spotify</button>
    </div>
  `;

  document.getElementById('login').addEventListener('click', () => {
    window.location.href = 'https://spotistat-backend.onrender.com/login';
  });
}

function fetchTopTracks() {
  fetch('https://spotistat-backend.onrender.com/top-tracks', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('track-list');
      const stats = document.getElementById('stats');

      if (!data.tracks) {
        container.innerHTML = '<p>Nie udało się pobrać utworów 😢</p>';
        return;
      }

      const totalMinutes = Math.round(data.tracks.length * 3.5);
      const totalPopularity = data.tracks.reduce((sum, t) => sum + t.popularity, 0);

      stats.innerHTML = `
        <p><strong>⏱️ Szacowany czas słuchania:</strong> ${totalMinutes} minut</p>
        <p><strong>📈 Popularność łączna:</strong> ${totalPopularity} (suma punktów Spotify)</p>
      `;

      container.innerHTML = data.tracks.map(track => `
        <a href="${track.url}" target="_blank" style="
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f0f0f0;
          padding: 0.75rem;
          border-radius: 12px;
          text-decoration: none;
          color: black;
        ">
          <img src="${track.image}" alt="${track.title}" style="width: 64px; height: 64px; border-radius: 8px;" />
          <div style="flex: 1;">
            <div><strong>#${track.position}</strong> ${track.title}</div>
            <div style="font-size: 0.9rem; color: #555;">${track.artist}</div>
          </div>
        </a>
      `).join('');

      renderTopAlbums(data.tracks);
    })
    .catch(err => {
      console.error('Błąd pobierania:', err);
      document.getElementById('track-list').innerHTML = '<p>Nie udało się pobrać danych 😢</p>';
    });
}

function renderTopAlbums(tracks) {
  const albumList = document.getElementById('album-list');
  const albumMap = new Map();

  tracks.forEach(track => {
    const key = `${track.album}-${track.artist}`;
    if (!albumMap.has(key)) {
      albumMap.set(key, {
        title: track.album,
        artist: track.artist,
        image: track.image,
        count: 1
      });
    } else {
      albumMap.get(key).count++;
    }
  });

  const sortedAlbums = [...albumMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  albumList.innerHTML = sortedAlbums.map((album, index) => `
    <div style="
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #eaeaea;
      padding: 0.75rem;
      border-radius: 12px;
    ">
      <img src="${album.image}" alt="${album.title}" style="width: 64px; height: 64px; border-radius: 8px;" />
      <div>
        <strong>#${index + 1}</strong> ${album.title}<br/>
        <span style="font-size: 0.9rem; color: #555;">${album.artist}</span><br/>
        <span style="font-size: 0.8rem;">🎵 ${album.count} utworów</span>
      </div>
    </div>
  `).join('');
}

if (accessToken && refreshToken) {
  renderLoggedIn();
} else {
  renderLoggedOut();
}

setInterval(() => {
  fetch('https://spotistat-backend.onrender.com/ping')
    .then(() => console.log('🔁 Ping backendu'))
    .catch(err => console.warn('❌ Ping failed', err));
}, 10 * 60 * 1000);