const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "fb0c6faf5b6276fcf00e69ff0bccbc63";

const createWeatherCard = (cityName, weatherItem, index) => {
    const date = weatherItem.dt_txt.split(" ")[0];
    const temperature = (weatherItem.main.temp - 273.15).toFixed(2);
    const { speed: windSpeed } = weatherItem.wind;
    const { humidity } = weatherItem.main;
    const { description, icon } = weatherItem.weather[0];

    const commonHTML = `
        <h6>Temp: ${temperature}°C</h6>
        <h6>Wind: ${windSpeed} M/S</h6>
        <h6>Humidity: ${humidity}%</h6>
    `;

    if (index === 0) {
        return `
            <div class="details">
                <h2>${cityName} (${date})</h2>
                ${commonHTML}
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
                <h6>${description}</h6>
            </div>
        `;
    } else {
        return `
            <li class="card">
                <h3>(${date})</h3>
                <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
                ${commonHTML}
            </li>
        `;
    }
}

const getWeatherDetails = async (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    try {
        const response = await fetch(WEATHER_API_URL);
        const data = await response.json();

        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            return !uniqueForecastDays.includes(forecastDate) && uniqueForecastDays.push(forecastDate);
        });

        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            index === 0 ? currentWeatherDiv.insertAdjacentHTML("beforeend", html) : weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        });
    } catch {
        alert("An error occurred while fetching the weather forecast!");
    }
}

const getCityCoordinates = async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    } catch {
        alert("An error occurred while fetching the coordinates!");
    }
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        async position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            try {
                const response = await fetch(API_URL);
                const data = await response.json();
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            } catch {
                alert("An error occurred while fetching the city name!");
            }
        },
        error => {
            const errorMessage = error.code === error.PERMISSION_DENIED
                ? "Geolocation request denied. Please reset location permission to grant access again."
                : "Geolocation request error. Please reset location permission.";
            alert(errorMessage);
        }
    );
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
