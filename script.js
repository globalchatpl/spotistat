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
    <div style="padding: 1rem; font-family: 'Roboto', sans-serif;">
      <h1 style="font-size: 1.5rem;">🎧 Twoje TOP 50 utworów</h1>
      <div id="stats" style="margin-top: 1rem; font-size: 1rem;"></div>
      <div id="track-list" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;"></div>
      <button id="logout" style="margin-top: 2rem; padding: 0.5rem 1rem;">Wyloguj się</button>
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

      // Szacowany czas słuchania (zakładamy ~3.5 minuty na utwór)
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
    })
    .catch(err => {
      console.error('Błąd pobierania:', err);
      document.getElementById('track-list').innerHTML = '<p>Nie udało się pobrać danych 😢</p>';
    });
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