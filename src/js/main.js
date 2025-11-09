const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const errorMessage = document.getElementById('error-message');
const currentWeatherSection = document.getElementById(
  'current-weather-section',
);
const currentCity = document.getElementById('current-city');
const currentDate = document.getElementById('current-date');
const currentTemperature = document.getElementById('current-temperature');
const currentWeatherIcon = document.getElementById('current-weather-icon');
const currentDescription = document.getElementById('current-description');
const currentHumidity = document.getElementById('current-humidity');
const currentWindSpeed = document.getElementById('current-wind-speed');
const forecastSection = document.getElementById('forecast-section');
const forecastContainer = document.getElementById('forecast-container');

async function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

async function fetchWeatherData(city) {
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=es`;

  try {
     const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new Error('No se pudo obtener el pronóstico');
    }
    const forecastData = await forecastResponse.json();
    await displayForecast(forecastData);
    await displayCurrentWeather(forecastData);
   } catch (error) {
    showError(error.message);
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('es-ES', options);
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  setTimeout(() => {
    errorMessage.classList.remove('show');
  }, 5000);
}

function hideError() {
  errorMessage.classList.remove('show');
}

async function displayCurrentWeather(data) {
  if (!data || !data.city.name) {
    showError('Invalid weather data received');
    return;
  }

  hideError();
  currentCity.textContent = data.city.name;
  currentDate.textContent = formatDate(Date.now());
  currentTemperature.textContent = Math.round(data.list[0].main.temp);
  currentDescription.textContent = data.list[0].weather[0].description;
  currentHumidity.textContent = `${data.list[0].main.humidity}%`;
  currentWindSpeed.textContent = `${Math.round(data.list[0].wind.speed * 3.6)} km/h`;

  const iconCode = data.list[0].weather[0].icon;
  currentWeatherIcon.src = await getWeatherIconUrl(iconCode);
  currentWeatherIcon.alt = data.list[0].weather[0].description;

  currentWeatherSection.classList.remove('hidden');
}

function clearCurrentWeather() {
  currentWeatherSection.classList.add('hidden');
  currentCity.textContent = '';
  currentDate.textContent = '';
  currentTemperature.textContent = '';
  currentDescription.textContent = '';
  currentHumidity.textContent = '';
  currentWindSpeed.textContent = '';
  currentWeatherIcon.src = '';
}

function handleSearch() {
  const cityName = cityInput.value.trim();

  if (!cityName) {
    showError('Please enter a city name');
    return;
  }

  clearCurrentWeather();
  clearForecast();

  if (typeof fetchWeatherData === 'function') {
    fetchWeatherData(cityName);
  } else {
    showError('Weather API not loaded');
  }
}

function getDayName(timestamp) {
  const date = new Date(timestamp * 1000);
  const options = { weekday: 'long' };
  return date.toLocaleDateString('es-ES', options);
}

async function createForecastDayCard(forecastItem) {
  const dayCard = document.createElement('div');
  dayCard.className = 'forecast-day-card';

  const dayName = document.createElement('div');
  dayName.className = 'forecast-day-name';
  dayName.textContent = getDayName(forecastItem.dt);

  const iconContainer = document.createElement('div');
  iconContainer.className = 'forecast-icon-container';

  const weatherIcon = document.createElement('img');
  weatherIcon.className = 'forecast-weather-icon';
  weatherIcon.src = await getWeatherIconUrl(forecastItem.weather[0].icon);
  weatherIcon.alt = forecastItem.weather[0].description;

  iconContainer.appendChild(weatherIcon);

  const temperature = document.createElement('div');
  temperature.className = 'forecast-temperature';
  temperature.textContent = `${Math.round(forecastItem.main.temp)}°C`;

  const description = document.createElement('div');
  description.className = 'forecast-description';
  description.textContent = forecastItem.weather[0].description;

  dayCard.appendChild(dayName);
  dayCard.appendChild(iconContainer);
  dayCard.appendChild(temperature);
  dayCard.appendChild(description);

  return dayCard;
}

function getForecastForNextFourDays(forecastData) {
  if (!forecastData || !forecastData.list) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysMap = new Map();
  const result = [];

  forecastData.list.forEach(item => {
    const itemDate = new Date(item.dt * 1000);
    itemDate.setHours(0, 0, 0, 0);

    if (itemDate <= today) {
      return;
    }

    const dayKey = itemDate.getTime();

    if (!daysMap.has(dayKey)) {
      daysMap.set(dayKey, item);
      result.push(item);

      if (result.length >= 4) {
        return;
      }
    }
  });

  return result.slice(0, 4);
}

async function displayForecast(forecastData) {
  if (!forecastData || !forecastData.list) {
    forecastSection.classList.add('hidden');
    return;
  }

  const nextFourDays = getForecastForNextFourDays(forecastData);

  if (nextFourDays.length === 0) {
    forecastSection.classList.add('hidden');
    return;
  }

  forecastContainer.innerHTML = '';

  for (const dayData of nextFourDays) {
    const dayCard = await createForecastDayCard(dayData);
    forecastContainer.appendChild(dayCard);
  }

  forecastSection.classList.remove('hidden');
}

function clearForecast() {
  forecastSection.classList.add('hidden');
  forecastContainer.innerHTML = '';
}

searchButton.addEventListener('click', handleSearch);

cityInput.addEventListener('keypress', event => {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

document.displayCurrentWeather = displayCurrentWeather;
document.displayForecast = displayForecast;
document.showError = showError;
document.clearCurrentWeather = clearCurrentWeather;
document.clearForecast = clearForecast;
