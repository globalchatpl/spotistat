const root = document.getElementById('root');
const logoutBtn = document.getElementById('logout');
const shareBtn = document.getElementById('share');
const timeRangeSelect = document.getElementById('time-range');
const tabs = document.querySelectorAll('.tab');
const statsDiv = document.getElementById('stats');

const params = new URLSearchParams(window.location.search);
const accessTokenFromUrl = params.get('access_token');
const refreshTokenFromUrl = params.get('refresh_token');

function clearUrl() {
  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');
let currentSection = 'tracks';
let currentRange = localStorage.getItem('range') || 'short_term';

if (accessTokenFromUrl && refreshTokenFromUrl) {
  localStorage.setItem('access_token', accessTokenFromUrl);
  localStorage.setItem('refresh_token', refreshTokenFromUrl);
  accessToken = accessTokenFromUrl;
  refreshToken = refreshTokenFromUrl;
  clearUrl();
}

if (!accessToken || !refreshToken) {
  renderLoggedOut();
} else {
  renderLoggedIn();
}

function renderLoggedOut() {
  root.innerHTML = `
    <div style="padding: 2rem; text-align: center;">
      <h2>Zaloguj się przez Spotify, aby zobaczyć swoje statystyki</h2>
      <button id="login" style="font-size:1.2rem; margin-top:1rem; padding: 0.75rem 1.5rem; background:#1db954; color:#fff; border:none; border-radius:10px; cursor:pointer;">Zaloguj się przez Spotify</button>
    </div>
  `;
  logoutBtn.style.display = 'none';
  shareBtn.style.display = 'none';
  timeRangeSelect.style.display = 'none';
  document.querySelector('.tabs').style.display = 'none';

  document.getElementById('login').onclick = () => {
    window.location.href = 'https://spotistat-backend.onrender.com/login';
  };
}

function renderLoggedIn() {
  logoutBtn.style.display = 'inline-block';
  timeRangeSelect.style.display = 'inline-block';
  document.querySelector('.tabs').style.display = 'flex';
  shareBtn.style.display = 'inline-block';
  timeRangeSelect.value = currentRange;

  highlightTab(currentSection);

  logoutBtn.onclick = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('range');
    location.reload();
  };

  timeRangeSelect.onchange = (e) => {
    currentRange = e.target.value;
    localStorage.setItem('range', currentRange);
    loadSection(currentSection);
  };

  tabs.forEach(tab => {
    tab.onclick = () => {
      currentSection = tab.dataset.section;
      highlightTab(currentSection);
      loadSection(currentSection);
    };
  });

  loadSection(currentSection);
}

function highlightTab(section) {
  tabs.forEach(tab => {
    if (tab.dataset.section === section) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

async function loadSection(section) {
  root.innerHTML = `<p style="text-align:center; font-size:1.4rem; margin-top: 3rem;">Ładowanie danych...</p>`;
  statsDiv.innerHTML = '';
  shareBtn.style.display = 'none';

  try {
    await refreshTokenIfNeeded();

    const sectionMap = {
      tracks: 'top-tracks',
      albums: 'top-albums',
      artists: 'top-artists'
    };

    const endpoint = sectionMap[section];

    const res = await fetch(`https://spotistat-backend.onrender.com/${endpoint}?time_range=${currentRange}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      throw new Error('Błąd pobierania danych. Spróbuj się wylogować i zalogować ponownie.');
    }

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      root.innerHTML = '<p style="text-align:center; font-size:1.3rem; margin-top:3rem;">Brak danych do wyświetlenia</p>';
      return;
    }

    renderList(data.items, section);
    shareBtn.style.display = 'inline-block';
  } catch (e) {
    root.innerHTML = `<p style="color:red; text-align:center; margin-top:3rem;">${e.message}</p>`;
  }
}

function renderList(items, section) {
  root.innerHTML = '';
  items.slice(0, 10).forEach((item, idx) => {
    let imageUrl = '';
    let title = '';
    let subtitle = '';
    let link = '#';

    if (section === 'tracks') {
      imageUrl = item.image;
      title = `${idx + 1}. ${item.title}`;
      subtitle = item.artist;
      link = item.url;
    } else if (section === 'albums') {
      imageUrl = item.image;
      title = `${idx + 1}. ${item.name}`;
      subtitle = item.artist;
      link = item.url;
    } else if (section === 'artists') {
      imageUrl = item.image;
      title = `${idx + 1}. ${item.name}`;
      subtitle = `Popularność: ${item.popularity}`;
      link = item.url;
    }

    const itemEl = document.createElement('a');
    itemEl.className = 'list-item';
    itemEl.href = link;
    itemEl.target = '_blank';
    itemEl.rel = 'noopener noreferrer';
    itemEl.innerHTML = `
      <img src="${imageUrl}" alt="${title}" />
      <div class="list-info">
        <div class="list-title">${title}</div>
        <div class="list-subtitle">${subtitle}</div>
      </div>
    `;
    root.appendChild(itemEl);
  });
}

async function refreshTokenIfNeeded() {
  // Można rozbudować później
  return true;
}

// PING co 5 minut do Rendera
setInterval(() => {
  fetch('https://spotistat-backend.onrender.com/ping')
    .then(() => console.log('Ping backendu...'))
    .catch(() => console.warn('Ping nie powiódł się'));
}, 5 * 60 * 1000); // 5 minut

// Udostępnianie top 10 jako grafika
shareBtn.onclick = async () => {
  shareBtn.disabled = true;
  shareBtn.textContent = 'Generowanie grafiki...';

  try {
    const canvas = await html2canvas(root, { backgroundColor: '#1db954' });
    canvas.toBlob(blob => {
      const file = new File([blob], 'spotify-top10.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          title: 'Moje Top 10 Spotify',
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = 'spotify-top10.png';
        link.href = canvas.toDataURL();
        link.click();
      }
      shareBtn.disabled = false;
      shareBtn.textContent = 'Udostępnij Top 10';
    });
  } catch (e) {
    alert('Coś poszło nie tak podczas generowania grafiki.');
    shareBtn.disabled = false;
    shareBtn.textContent = 'Udostępnij Top 10';
  }
};