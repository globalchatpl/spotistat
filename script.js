const params = new URLSearchParams(window.location.search);
const accessToken = params.get('access_token');
const refreshToken = params.get('refresh_token');

const root = document.getElementById('root');

if (accessToken) {
  root.innerHTML = `<h1>Token Spotify</h1>
                    <p>Access Token: ${accessToken}</p>
                    <p>Refresh Token: ${refreshToken}</p>`;
} else {
  root.innerHTML = `<h1>Spotistat</h1>
                    <button id="login">Zaloguj się przez Spotify</button>`;

  document.getElementById('login').addEventListener('click', () => {
    // Zmień adres na adres Twojego backendu renderowego
    window.location.href = 'https://spotistat-backend.onrender.com/login';
  });
}