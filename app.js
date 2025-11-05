const api = {
    key: "44502fc60dbbececfb2a2a52f202564e",
    base: "https://api.openweathermap.org/data/2.5/"
  }

const searchBox = document.querySelector('#search-bar');
const searchButton = document.querySelector('#search-button');
const mainBg = document.getElementById('main-bg');
const temp = document.querySelector('.temp');
const suggestionsDropdown = document.getElementById('city-suggestions');

let currentSuggestions = [];
let selectedIndex = -1;
let searchTimeout;

// Fetch and show city suggestions
function fetchCitySuggestions(query) {
    console.log('Fetching suggestions for:', query); // Debug log
    
    if (query.length < 2) {
        console.log('Query too short, hiding dropdown'); // Debug log
        suggestionsDropdown.style.display = 'none';
        return;
    }

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${api.key}`;
    console.log('Fetching from URL:', url); // Debug log

    fetch(url)
        .then(res => res.json())
        .then(cities => {
            console.log('Received cities:', cities); // Debug log
            currentSuggestions = cities;
            
            if (cities.length > 0) {
                const html = cities.map((city, index) => `
                    <div class="suggestion-item" data-index="${index}">
                        ${city.name}${city.state ? `, ${city.state}` : ''}${city.country ? `, ${city.country}` : ''}
                    </div>
                `).join('');
                
                suggestionsDropdown.innerHTML = html;
                suggestionsDropdown.style.display = 'block';
                console.log('Showing dropdown with items:', cities.length); // Debug log

                // Add click handlers to suggestions
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        console.log('Suggestion clicked:', item.textContent); // Debug log
                        const index = parseInt(item.dataset.index);
                        if (index >= 0 && index < currentSuggestions.length) {
                            selectCity(currentSuggestions[index]);
                        }
                    });
                });
            } else {
                console.log('No cities found, hiding dropdown'); // Debug log
                suggestionsDropdown.style.display = 'none';
            }
        })
        .catch(err => {
            console.error('City suggestion fetch failed:', err); // Changed to error for better visibility
            suggestionsDropdown.style.display = 'none';
        });
}

// Handle selecting a city
function selectCity(city) {
    searchBox.value = `${city.name}${city.state ? `, ${city.state}` : ''}${city.country ? `, ${city.country}` : ''}`;
    suggestionsDropdown.style.display = 'none';
    getWeather(searchBox.value);
    temp.style.display = "block";
}

// Input event listener with debouncing
searchBox.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchCitySuggestions(query), 300);
});

// Clear placeholder on focus
searchBox.addEventListener('focus', function() {
    if (searchBox.value === 'Search...') {
        searchBox.value = '';
    }
    // Show suggestions again if there's text
    if (searchBox.value.trim().length >= 2) {
        fetchCitySuggestions(searchBox.value.trim());
    }
});

// Handle keyboard navigation
searchBox.addEventListener('keydown', function(e) {
    const items = document.querySelectorAll('.suggestion-item');
    
    if (suggestionsDropdown.style.display === 'none') return;

    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
            break;
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
            break;
        case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < currentSuggestions.length) {
                selectCity(currentSuggestions[selectedIndex]);
            } else if (searchBox.value.trim()) {
                getWeather(searchBox.value.trim());
                temp.style.display = "block";
            }
            break;
        case 'Escape':
            suggestionsDropdown.style.display = 'none';
            selectedIndex = -1;
            break;
    }
});

// Update visual selection in dropdown
function updateSelection(items) {
    items.forEach(item => item.classList.remove('active'));
    if (selectedIndex >= 0) {
        items[selectedIndex].classList.add('active');
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
}

// Close suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
        suggestionsDropdown.style.display = 'none';
        selectedIndex = -1;
    }
});
const saveButton = document.getElementById('save-button');
const showSavedButton = document.getElementById('show-saved-button');
const compareButton = document.getElementById('compare-button');
const savedListEl = document.getElementById('saved-list');
const compareView = document.getElementById('compare-view');

let lastDisplayedWeather = null; // stores latest fetched weather object for saving

searchButton.addEventListener('click', function(){
  if (searchBox.value.length > 0){
    getWeather(searchBox.value);
    temp.style.display = "block";
  }
  else {
    Swal.fire({
      title: 'Oops...',
      text: 'Please enter the location and try again.',
      icon: 'warning',
      confirmButtonText: 'OK'
    });
  }
});


function getWeather(location){
  fetch(`${api.base}weather?q=${location}&units=metric&APPID=${api.key}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    displayWeather(data);
  })
  .catch((error) => {
    Swal.fire({
      title: "Error!",
      text: error.message || "An unexpected error occurred.",
      icon: "error",
      confirmButtonText: "OK"
    });
  });
}

function getWeatherByCoords(lat, lon){
  fetch(`${api.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${api.key}`)
    .then(res => res.json())
    .then(data => displayWeather(data))
    .catch(err => {
      Swal.fire({ title: 'Error', text: err.message || 'Could not fetch weather for this location', icon: 'error' });
    });
}

// reverse geocode using OpenWeatherMap geo API to get nicer place name
function reverseGeocode(lat, lon){
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${api.key}`;
  return fetch(url)
    .then(res => res.json())
    .then(arr => {
      if (Array.isArray(arr) && arr.length > 0) {
        const item = arr[0];
        return { name: item.name || '', country: item.country || '' };
      }
      return { name: '', country: '' };
    })
    .catch(() => ({ name: '', country: '' }));
}

function displayWeather(data) {
  if (!data || data.cod && data.cod !== 200) {
    Swal.fire({ title: 'Not found', text: 'Location not found or API error', icon: 'warning' });
    return;
  }
  const city = document.getElementById("city");
  const date = document.getElementById("date");
  const temperature = document.getElementById("temp");
  const weather = document.getElementById("weather");
  const now = new Date();

  date.textContent = buildDate(now);
  city.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent= `${Math.round(data.main.temp)}°C`;
  weather.textContent = `${data.weather[0].description.toUpperCase()}`;
  if (data.main.temp >= 16){
      mainBg.classList.add('warm-bg');
  }
  else {
      mainBg.classList.remove('warm-bg');
  }

  // store last displayed weather (minimal fields) for saving/comparison
  lastDisplayedWeather = {
    id: `${data.id}`,
    name: data.name,
    country: data.sys.country,
    temp: Math.round(data.main.temp),
    weather: data.weather[0].description,
    dt: Date.now(),
    coord: data.coord
  };
  // ensure temp area visible
  temperature.style.display = 'block';
}

function buildDate(d) {
  const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}, ${date} ${month} ${year}`;
}

searchBox.addEventListener('keypress', function(e){
  if (e.key === 'Enter'){
    e.preventDefault();
    searchButton.click();
  }
});

// Map initialization & handlers
function initMap(){
  try {
    const map = L.map('map').setView([39.92, 32.85], 5); // Ankara-ish default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let marker = null;
    map.on('click', function(e){
      const {lat, lng} = e.latlng;
      if (marker) { map.removeLayer(marker); }
      marker = L.marker([lat, lng]).addTo(map);
      // fetch weather for clicked coords, then try reverse geocoding to get nicer name
      getWeatherByCoords(lat, lng);
      reverseGeocode(lat, lng).then(place => {
        if (place && (place.name || place.country)){
          const cityEl = document.getElementById('city');
          cityEl.textContent = `${place.name}${place.country ? ', ' + place.country : ''}`;
          // update lastDisplayedWeather if present
          if (lastDisplayedWeather) {
            lastDisplayedWeather.name = place.name || lastDisplayedWeather.name;
            lastDisplayedWeather.country = place.country || lastDisplayedWeather.country;
          }
        }
      });
    });
  } catch (err) {
    console.warn('Leaflet not available or map init failed', err);
  }
}

// Persistence: saved weather entries in localStorage
function loadSaved() {
  try {
    const raw = localStorage.getItem('savedWeather');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCurrent(){
  if (!lastDisplayedWeather) {
    Swal.fire({ title: 'Nothing to save', text: 'Search or pick a location first', icon: 'info' });
    return;
  }
  const saved = loadSaved();
  // prevent duplicate by same id and same timestamp window
  const exists = saved.find(s => s.id === lastDisplayedWeather.id);
  if (exists) {
    Swal.fire({ title: 'Already saved', text: `${lastDisplayedWeather.name} already in saved list`, icon: 'info' });
    return;
  }
  saved.push(lastDisplayedWeather);
  localStorage.setItem('savedWeather', JSON.stringify(saved));
  renderSavedList();
  Swal.fire({ title: 'Saved', text: `${lastDisplayedWeather.name} saved`, icon: 'success', timer: 1200, showConfirmButton: false });
}

function renderSavedList(){
    const saved = loadSaved();
    const savedGrid = savedListEl.querySelector('.saved-grid');
    if (!savedListEl || !savedGrid) return;
    
    if (saved.length === 0){
        savedGrid.innerHTML = '<div class="no-saved">No saved locations yet.<br><small>Search or click the map to add locations</small></div>';
        return;
    }

    // Get weather icon based on description
    function getWeatherIcon(weather) {
        const w = weather.toLowerCase();
        if (w.includes('clear')) return 'sun';
        if (w.includes('cloud')) return 'cloud';
        if (w.includes('rain')) return 'cloud-rain';
        if (w.includes('snow')) return 'snowflake';
        if (w.includes('thunder')) return 'bolt';
        if (w.includes('fog') || w.includes('mist')) return 'smog';
        return 'cloud';
    }

    // Generate time since saved
    function getTimeSince(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    const html = saved.map((s, i) => `
        <div class="weather-card" data-temp="${s.temp}">
            <div class="card-header">
                <div class="location-name">
                    <strong>${s.name || 'Unknown'}</strong>
                    <span class="country">${s.country || ''}</span>
                </div>
                <div class="card-actions">
                    <input type="checkbox" id="compare-${i}" data-idx="${i}" class="compare-check">
                    <label for="compare-${i}" class="compare-label" title="Select for comparison">
                        <i class="fas fa-chart-line"></i>
                    </label>
                </div>
            </div>
            
            <div class="card-body">
                <div class="weather-icon">
                    <i class="fas fa-${getWeatherIcon(s.weather)}"></i>
                </div>
                <div class="weather-info">
                    <div class="temperature">${s.temp}°C</div>
                    <div class="condition">${s.weather}</div>
                </div>
            </div>
            
            <div class="card-footer">
                <span class="timestamp" title="${new Date(s.dt).toLocaleString()}">
                    <i class="far fa-clock"></i> ${getTimeSince(s.dt)}
                </span>
                <div class="card-controls">
                    <button class="edit-btn modern-button-small" data-idx="${i}" title="Edit name">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn modern-button-small" data-idx="${i}" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    savedGrid.innerHTML = html;

    // Attach event listeners
    savedGrid.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.idx, 10);
            editSaved(idx);
        });
    });
    
    savedGrid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.idx, 10);
            deleteSaved(idx);
        });
    });

    // Add select all/clear all functionality
    const selectAllBtn = savedListEl.querySelector('.select-all-btn');
    const clearAllBtn = savedListEl.querySelector('.clear-all-btn');
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            savedGrid.querySelectorAll('.compare-check').forEach(cb => cb.checked = true);
        });
    }
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            savedGrid.querySelectorAll('.compare-check').forEach(cb => cb.checked = false);
        });
    }
}

function deleteSaved(idx){
  const saved = loadSaved();
  const item = saved[idx];
  if (!item) return;
  Swal.fire({
    title: `Delete ${item.name}?`,
    text: 'This will remove the saved location.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete'
  }).then(res => {
    if (res.isConfirmed){
      saved.splice(idx, 1);
      localStorage.setItem('savedWeather', JSON.stringify(saved));
      renderSavedList();
    }
  });
}

function editSaved(idx){
  const saved = loadSaved();
  const item = saved[idx];
  if (!item) return;
  Swal.fire({
    title: 'Edit label',
    input: 'text',
    inputLabel: 'Location label',
    inputValue: item.name || '',
    showCancelButton: true,
  }).then(res => {
    if (res.isConfirmed && typeof res.value === 'string'){
      item.name = res.value.trim() || item.name;
      saved[idx] = item;
      localStorage.setItem('savedWeather', JSON.stringify(saved));
      renderSavedList();
    }
  });
}

function toggleSavedList(){
  if (!savedListEl) return;
  if (savedListEl.style.display === 'none' || savedListEl.style.display === ''){
    renderSavedList();
    savedListEl.style.display = 'block';
  } else {
    savedListEl.style.display = 'none';
  }
}

function compareSelected(){
  const checks = Array.from(document.querySelectorAll('.compare-check')).filter(c => c.checked);
  if (checks.length < 2){
    Swal.fire({ title: 'Select two or more', text: 'Please select at least two saved locations to compare', icon: 'info' });
    return;
  }
  const saved = loadSaved();
  const items = checks.map(c => saved[parseInt(c.dataset.idx, 10)]).filter(Boolean);
  // build comparison HTML with chart placeholder
  let html = '<div class="compare-grid">';
  html += '<div class="compare-chart-wrap"><canvas id="compare-chart" width="600" height="300"></canvas></div>';
  html += '<div class="compare-cards">';
  items.forEach(it => {
    html += `<div class="compare-card"><h3>${it.name || 'Unknown'}, ${it.country || ''}</h3><p><strong>${it.temp}°C</strong></p><p>${it.weather}</p><p>lat:${it.coord.lat.toFixed(2)}, lon:${it.coord.lon.toFixed(2)}</p></div>`;
  });
  html += '</div></div>';
  // build modal-only HTML (don't alter the on-page compareView element)
  const modalHtml = '<div class="compare-grid">' +
    '<div class="compare-chart-wrap"><canvas id="compare-chart" width="600" height="300"></canvas></div>' +
    '<div class="compare-cards">' + items.map(it => `
      <div class="compare-card"><h3>${it.name || 'Unknown'}, ${it.country || ''}</h3><p><strong>${it.temp}°C</strong></p><p>${it.weather}</p><p>lat:${it.coord.lat.toFixed(2)}, lon:${it.coord.lon.toFixed(2)}</p></div>
    `).join('') + '</div></div>';

  Swal.fire({
    title: 'Comparison',
    html: modalHtml,
    width: '85%',
    showCloseButton: true,
    focusConfirm: false,
    showConfirmButton: false,
    didOpen: () => {
      // render chart inside the modal only
      try {
        const modalCanvas = Swal.getHtmlContainer().querySelector('#compare-chart');
        if (modalCanvas){
          if (window._compareChartModalInstance){ window._compareChartModalInstance.destroy(); }
          const ctx2 = modalCanvas.getContext('2d');
          window._compareChartModalInstance = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: items.map(i => `${i.name || 'Unknown'} (${i.country||''})`),
              datasets: [{ label: 'Temperature (°C)', data: items.map(i=>i.temp), backgroundColor: 'rgba(75,192,192,0.7)' }]
            },
            options: { responsive: true }
          });
        }
      } catch(e){ console.warn('modal chart error', e); }
    },
    willClose: () => {
      // destroy modal chart instance when modal closes to avoid leakage
      try { if (window._compareChartModalInstance){ window._compareChartModalInstance.destroy(); window._compareChartModalInstance = null; } } catch(e){}
    }
  });
}

// wire up buttons
if (saveButton) saveButton.addEventListener('click', saveCurrent);
if (showSavedButton) showSavedButton.addEventListener('click', toggleSavedList);
if (compareButton) compareButton.addEventListener('click', compareSelected);

// initialize map on load and pre-render saved list
window.addEventListener('load', function(){
  initMap();
  renderSavedList();
});