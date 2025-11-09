const elements = {
  cityInput: document.getElementById('city-input'),
  searchButton: document.getElementById('search-button'),
  errorMessage: document.getElementById('error-message'),
  weatherSection: document.getElementById('weather-section'),
  forecastContainer: document.getElementById('forecast-container'),
};

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const API_URL = import.meta.env.VITE_OPENWEATHER_API_URL;
const ICON_URL = import.meta.env.VITE_OPENWEATHER_ICON_URL;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return {
    weekday: date.toLocaleDateString('es-ES', { weekday: 'long' }),
    date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
};

const showError = (message) => {
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.add('show');
  setTimeout(() => elements.errorMessage.classList.remove('show'), 5000);
};

const getNextDays = (list) => {
  const seen = new Set();
  return list.filter(item => {
    const day = item.dt_txt.split(' ')[0];
    if (!seen.has(day) && day !== new Date().toISOString().split('T')[0]) {
      seen.add(day);
      return true;
    }
    return false;
  }).slice(0, 4);
};

const displayWeather = (data) => {
  const current = data.list[0];
  const { weekday, date } = formatDate(current.dt_txt);
  
  elements.weatherSection.innerHTML = `
    <div class="current-weather">
      <h2>${data.city.name}</h2>
      <p class="weekday">${weekday}</p>
      <p class="date">${date}</p>
      <img src="${ICON_URL}${current.weather[0].icon}@2x.png" alt="${current.weather[0].description}">
      <div class="temp">${Math.round(current.main.temp)}°C</div>
      <p class="description">${current.weather[0].description}</p>
      <div class="details">
        <span>💧 ${current.main.humidity}%</span>
        <span>💨 ${Math.round(current.wind.speed * 3.6)} km/h</span>
      </div>
    </div>
  `;
  
  elements.forecastContainer.innerHTML = getNextDays(data.list).map(item => {
    const { weekday, date } = formatDate(item.dt_txt);
    return `
      <div class="forecast-card">
        <p class="forecast-weekday">${weekday}</p>
        <p class="forecast-date">${date}</p>
        <img src="${ICON_URL}${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
        <p class="forecast-temp">${Math.round(item.main.temp)}°C</p>
        <p class="forecast-desc">${item.weather[0].description}</p>
      </div>
    `;
  }).join('');
  
  elements.weatherSection.classList.remove('hidden');
};

const fetchWeather = async (city) => {
  try {
    const response = await fetch(`${API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
    if (!response.ok) throw new Error('Ciudad no encontrada');
    
    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    showError(error.message);
    elements.weatherSection.classList.add('hidden');
  }
};

const handleSearch = () => {
  const city = elements.cityInput.value.trim();
  if (!city) {
    showError('Por favor introduce una ciudad');
    return;
  }
  fetchWeather(city);
};

elements.searchButton.addEventListener('click', handleSearch);
elements.cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});
