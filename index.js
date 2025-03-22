const apiKey = '27578b1a5e1f0026ac5ea6638936f66a';
const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');
const countryTxt = document.querySelector('.country-text');
const tempTxt = document.querySelector('.temp-text');
const conditionTxt = document.querySelector('.condition-text');
const humidityValueTxt = document.querySelector('.humidity-value-text');
const windValueTxt = document.querySelector('.wind-value-text');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-text');
const forecastItemsContainer = document.querySelector('.forecast-item-container');

// Event listeners for search button & enter key
searchBtn.addEventListener('click', () => {
    fetchWeatherData();
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        fetchWeatherData();
    }
});

function fetchWeatherData() {
    const city = cityInput.value.trim();
    if (city !== '') {
        updateWeatherInfo(city);
        cityInput.value = '';
        cityInput.blur();
    }
}

// Fetch data from OpenWeather API
async function getFetchData(endpoint, city) {
    try {
        const URL = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// Get weather icon based on condition ID
function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return 'thunderstorm.svg';
    if (id >= 300 && id <= 321) return 'drizzle.svg';
    if (id >= 500 && id <= 531) return 'rain.svg';
    if (id >= 600 && id <= 622) return 'snow.svg';
    if (id >= 701 && id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

// Get current date in "Weekday, DD MMM" format
function getCurrentDate() {
    const currentDate = new Date();
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return currentDate.toLocaleDateString('en-GB', options);
}

// Update weather info
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);

    if (!weatherData || weatherData.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    console.log(weatherData);

    const { 
        name: country, 
        main: { temp, humidity }, 
        weather: [{ id, main }], 
        wind: { speed } 
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = `${Math.round(temp)} °C`;
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = `${humidity} %`;
    windValueTxt.textContent = `${speed} M/s`;
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    await updateForecastsInfo(city);
    showDisplaySection(weatherInfoSection);
}

// Create forecast item elements
function updateForecastsItems(weatherData) {
    const { dt_txt: date, weather: [{ id }], main: { temp } } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = { day: '2-digit', month: 'short' };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-text">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" alt="Weather Icon" class="forecast-item-image">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

// Fetch & update forecast data
async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);
    if (!forecastsData || forecastsData.cod !== "200") {
        console.error("Forecast data not available");
        return;
    }

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    // Clear previous forecast data before adding new ones
    forecastItemsContainer.innerHTML = '';

    forecastsData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastsItems(forecastWeather);
        }
    });
}

// Show only the selected section
function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => {
        sec.style.display = 'none';
    });
    section.style.display = 'flex';
}
