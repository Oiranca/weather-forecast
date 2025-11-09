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
  const today = new Date().toISOString().split('T')[0];
  const seen = new Set();
  
  return list
    .filter(({ dt_txt }) => {
      const day = dt_txt.split(' ')[0];
      if (day !== today && !seen.has(day)) {
        seen.add(day);
        return true;
      }
      return false;
    })
    .slice(0, 4);
};

const displayWeather = ({ list, city }) => {
  const current = list[0];
  const { weekday, date } = formatDate(current.dt_txt);
  const { temp, humidity } = current.main;
  const { icon, description } = current.weather[0];
  const windSpeed = Math.round(current.wind.speed * 3.6);
  
  elements.weatherSection.innerHTML = `
    <div class="current-weather">
      <h2>${city.name}</h2>
      <p class="weekday">${weekday}</p>
      <p class="date">${date}</p>
      <img src="${ICON_URL}${icon}@2x.png" alt="${description}">
      <div class="temp">${Math.round(temp)}°C</div>
      <p class="description">${description}</p>
      <div class="details">
        <span>💧 ${humidity}%</span>
        <span>💨 ${windSpeed} km/h</span>
      </div>
    </div>
  `;
  
  elements.forecastContainer.innerHTML = getNextDays(list)
    .map(({ dt_txt, main, weather }) => {
      const { weekday, date } = formatDate(dt_txt);
      return `
        <div class="forecast-card">
          <p class="forecast-weekday">${weekday}</p>
          <p class="forecast-date">${date}</p>
          <img src="${ICON_URL}${weather[0].icon}@2x.png" alt="${weather[0].description}">
          <p class="forecast-temp">${Math.round(main.temp)}°C</p>
          <p class="forecast-desc">${weather[0].description}</p>
        </div>
      `;
    })
    .join('');
  
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
  if (!city) return showError('Por favor introduce una ciudad');
  fetchWeather(city);
};

elements.searchButton.addEventListener('click', handleSearch);
elements.cityInput.addEventListener('keypress', ({ key }) => {
  if (key === 'Enter') handleSearch();
});
