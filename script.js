// Pobierz tokeny z URL
const params = new URLSearchParams(window.location.search);
const accessToken = params.get('access_token');
const refreshToken = params.get('refresh_token');

const root = document.getElementById('root');

if (accessToken) {
  root.innerHTML = `<h1>Token Spotify</h1>
                    <p>Access Token: ${accessToken}</p>
                    <p>Refresh Token: ${refreshToken}</p>`;
} else {
  root.innerHTML = `<h1>Brak tokena</h1>
                    <p>Zaloguj się przez backend</p>`;
}