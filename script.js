const root = document.getElementById('root');
const params = new URLSearchParams(window.location.search);
const accessTokenFromUrl = params.get('access_token');
const refreshTokenFromUrl = params.get('refresh_token');

// Czyszczenie URL z parametrami po zalogowaniu
function clearUrl() {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');

// Jeśli są tokeny w URL, zapisujemy do localStorage
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
      <h1 style="font-size: 1.5rem;">🎧 Jesteś zalogowany!</h1>
      <p><strong>Access Token:</strong><br>${accessToken}</p>
      <p><strong>Refresh Token:</strong><br>${refreshToken}</p>
      <button id="logout" style="margin-top: 1rem; padding: 0.5rem 1rem;">Wyloguj się</button>
    </div>
  `;

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    location.reload();
  });
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

// Główna logika
if (accessToken && refreshToken) {
  renderLoggedIn();
} else {
  renderLoggedOut();
}

// Render hack: ping co 10 min
setInterval(() => {
  fetch('https://spotistat-backend.onrender.com/ping')
    .then(() => console.log('🔁 Ping backendu'))
    .catch(err => console.warn('❌ Ping failed', err));
}, 10 * 60 * 1000); // 10 minut