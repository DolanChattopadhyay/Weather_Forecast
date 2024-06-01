const apiKey = 'd8b6e08082042649c0fe4387baace9f7';
const unsplashAccessKey = '0_An9406bjqVCTKnmWpYjyiDAoJGAQzw7YlJst8iEBk';

document.getElementById('searchButton').addEventListener('click', async () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        const weatherData = await fetchWeather(city);
        if (weatherData) {
            displayWeather(weatherData);
            addCityToDropdown(city);
            changeBackgroundImage(city);
        }
    } else {
        displayError('Please enter a city name');
    }
});

document.getElementById('currentLocationButton').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const weatherData = await fetchWeatherByCoords(latitude, longitude);
        if (weatherData) {
            displayWeather(weatherData);
            changeBackgroundImage(weatherData.name); // Pass the city name to changeBackgroundImage
        }
    }, () => {
        displayError('Unable to retrieve your location');
    });
});

document.getElementById('recentCitiesButton').addEventListener('click', () => {
    const recentCitiesList = document.getElementById('recentCitiesList');
    recentCitiesList.classList.toggle('hidden');
});

async function fetchWeather(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        return data;
    } catch (error) {
        displayError(error.message);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Location not found');
        const data = await response.json();
        return data;
    } catch (error) {
        displayError(error.message);
    }
}

function displayWeather(data) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    weatherDisplay.classList.remove('hidden');
    weatherDisplay.innerHTML = `
        <div class="flex justify-between items-center">
            <div class="flex-1">
                <h2 id="city-name" class="text-3xl font-bold mb-4">${data.name} (${new Date(data.dt * 1000).toLocaleDateString()})</h2>
                <p id="temperature" class="mb-2 text-lg">Temperature: ${data.main.temp.toFixed(2)}°C</p>
                <p id="wind" class="mb-2 text-lg">Wind: ${data.wind.speed} M/S</p>
                <p id="humidity" class="mb-2 text-lg">Humidity: ${data.main.humidity}%</p>
            </div>
            <div class="flex flex-col items-center">
                <img id="weather-icon" src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather icon" class="inline-block w-16 h-16 mb-2">
                <p id="weather-description" class="text-lg mt-2">${data.weather[0].description}</p>
            </div>
        </div>
    `;
    fetchExtendedForecast(data.name);
}

async function fetchExtendedForecast(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Extended forecast not found');
        const data = await response.json();
        displayExtendedForecast(data);
    } catch (error) {
        displayError(error.message);
    }
}

function displayExtendedForecast(data) {
    var heading = document.getElementById('extendedForecast');
    heading.classList.remove('hidden');
    const extendedForecastDisplay = document.getElementById('extendedForecastDisplay');
    extendedForecastDisplay.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item bg-lime-300 text-blue-950 p-4 rounded-lg shadow-md';

        forecastItem.innerHTML = `
            <p>${new Date(forecast.dt * 1000).toLocaleDateString()}</p>
            <p>Temp: ${forecast.main.temp.toFixed(2)}°C</p>
            <p>Wind: ${forecast.wind.speed} M/S</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
            <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather icon">
        `;
        extendedForecastDisplay.appendChild(forecastItem);
    }
}

function addCityToDropdown(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(city)) {
        recentCities.push(city);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
    updateDropdown();
}

function removeCityFromDropdown(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentCities = recentCities.filter(item => item !== city);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    updateDropdown();
}

function updateDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const recentCitiesList = document.getElementById('recentCitiesList');
    const recentCitiesButton = document.getElementById('recentCitiesButton');

    if (recentCities.length === 0) {
        recentCitiesButton.classList.add('hidden');
    } else {
        recentCitiesButton.classList.remove('hidden');
    }

    recentCitiesList.innerHTML = '';
    recentCities.forEach(city => {
        const cityItem = document.createElement('div');
        cityItem.className = 'city-item flex justify-between items-center bg-gray-200 px-4 py-2 rounded-lg mb-2 cursor-pointer';
        cityItem.innerHTML = `
            <span>${city}</span>
            <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="removeCityFromDropdown('${city}')">Remove</button>
        `;
        cityItem.addEventListener('click', async () => {
            const weatherData = await fetchWeather(city);
            if (weatherData) {
                displayWeather(weatherData);
                document.getElementById('cityInput').value = city;
                changeBackgroundImage(city);
                showDropdownTemporarily(); // Show dropdown for 3 seconds
            }
        });
        recentCitiesList.appendChild(cityItem);
    });
}

function displayError(message) {
    const errorDisplay = document.getElementById('errorDisplay');
    errorDisplay.textContent = message;
}

async function changeBackgroundImage(city) {
    try {
        const url = `https://api.unsplash.com/search/photos?query=${city}&client_id=${unsplashAccessKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.results.length > 0) {
            document.getElementById('dashboard').style.backgroundImage = `url(${data.results[0].urls.regular})`;
            document.getElementById('dashboard').style.backgroundSize = 'cover';
            document.getElementById('dashboard').style.backgroundPosition = 'center';
            // Remove background color if there's an image
            document.getElementById('dashboard').style.backgroundColor = '';
        } else {
            // No image found, set background color to lime-300
            document.getElementById('dashboard').style.backgroundImage = 'none';
            document.getElementById('dashboard').style.backgroundColor = 'lime-300';
        }
    } catch {
        // Error occurred, set background color to white
        document.getElementById('dashboard').style.backgroundImage = 'none';
        document.getElementById('dashboard').style.backgroundColor = 'white';
    }
}

function showDropdownTemporarily() {
    const recentCitiesList = document.getElementById('recentCitiesList');
    recentCitiesList.classList.remove('hidden');
    setTimeout(() => {
        recentCitiesList.classList.add('hidden');
    }, 3000);
}

// Hide dropdown when clicking outside
document.addEventListener('click', (event) => {
    const recentCitiesButton = document.getElementById('recentCitiesButton');
    const recentCitiesList = document.getElementById('recentCitiesList');
    if (!recentCitiesButton.contains(event.target) && !recentCitiesList.contains(event.target)) {
        recentCitiesList.classList.add('hidden');
    }
});

updateDropdown();
