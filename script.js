const root = document.getElementById('root');
const params = new URLSearchParams(window.location.search);
const accessTokenFromUrl = params.get('access_token');
const refreshTokenFromUrl = params.get('refresh_token');

// Funkcja do czyszczenia URL po pobraniu tokenów
function clearUrl() {
  window.history.replaceState({}, document.title, '/');
}

let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');

// Jeśli mamy tokeny w URL, zapisz je do localStorage i wyczyść URL
if (accessTokenFromUrl && refreshTokenFromUrl) {
  localStorage.setItem('access_token', accessTokenFromUrl);
  localStorage.setItem('refresh_token', refreshTokenFromUrl);
  accessToken = accessTokenFromUrl;
  refreshToken = refreshTokenFromUrl;
  clearUrl();
}

function renderLoggedIn() {
  root.innerHTML = `
    <h1>Jesteś zalogowany!</h1>
    <p><strong>Access Token:</strong><br>${accessToken}</p>
    <p><strong>Refresh Token:</strong><br>${refreshToken}</p>
    <button id="logout">Wyloguj się</button>
  `;

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    location.reload();
  });
}

function renderLoggedOut() {
  root.innerHTML = `
    <h1>Spotistat</h1>
    <button id="login">Zaloguj się przez Spotify</button>
  `;

  document.getElementById('login').addEventListener('click', () => {
    window.location.href = 'https://spotistat-backend.onrender.com/login';
  });
}

if (accessToken && refreshToken) {
  renderLoggedIn();
} else {
  renderLoggedOut();
}

// Ping backend co 10 minut, by nie zasypiał (Render hack)
setInterval(() => {
  fetch('https://spotistat-backend.onrender.com/ping')
    .then(() => console.log('🔁 Ping backendu'))
    .catch(err => console.warn('❌ Ping failed', err));
}, 10 * 60 * 1000); // 10 minut