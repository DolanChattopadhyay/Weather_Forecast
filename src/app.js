const apiKey = 'd8b6e08082042649c0fe4387baace9f7';
const unsplashAccessKey = '0_An9406bjqVCTKnmWpYjyiDAoJGAQzw7YlJst8iEBk';

// Event listeners for buttons
document.getElementById('searchButton').addEventListener('click', async () => {
    handleSearch();
});

// Add event listener to clear button
document.getElementById('clearInput').addEventListener('click', () => {
    console.log('Clear button clicked'); // Debugging statement
    document.getElementById('cityInput').value = ''; // Clear the input field
});


document.getElementById('currentLocationButton').addEventListener('click', async () => {
    clearError(); // Clear previous error message
    showLoading();
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const weatherData = await fetchWeatherByCoords(latitude, longitude);
        if (weatherData) {
            displayWeather(weatherData);
        }
        hideLoading();
    }, () => {
        displayError('Unable to retrieve your location');
        hideLoading();
    });
});

document.getElementById('recentCitiesButton').addEventListener('click', () => {
    const recentCitiesList = document.getElementById('recentCitiesList');
    recentCitiesList.classList.toggle('hidden');
});


// Hide dropdown when clicking outside
document.addEventListener('click', (event) => {
    const recentCitiesList = document.getElementById('recentCitiesList');
    const recentCitiesButton = document.getElementById('recentCitiesButton');
    if (!recentCitiesList.contains(event.target) && !recentCitiesButton.contains(event.target)) {
        recentCitiesList.classList.add('hidden');
    }
});

async function handleSearch() {
    clearError(); // Clear previous error message
    showLoading();
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        const weatherData = await fetchWeather(city);
        if (weatherData) {
            displayWeather(weatherData);
            addCityToDropdown(city);
        }
    } else {
        displayError('Please enter a city name');
    }
    hideLoading();
}

// Fetch weather data by city name
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

// Fetch weather data by coordinates
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

// Display weather data
function displayWeather(data) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    weatherDisplay.classList.remove('hidden');
    weatherDisplay.innerHTML = `
        <div class="flex justify-between items-center transition duration-300 ease-in-out transform hover:scale-105">
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
    changeBackgroundImage(data.name); // Change background image based on city name
    fetchExtendedForecast(data.name);
}

// Fetch extended forecast data
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

// Display extended forecast data
function displayExtendedForecast(data) {
    const heading = document.getElementById('extendedForecast');
    heading.classList.remove('hidden');
    const extendedForecastDisplay = document.getElementById('extendedForecastDisplay');
    extendedForecastDisplay.innerHTML = '';
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item bg-lime-400 text-black p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105';
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

// Display error message
function displayError(message) {
    const errorDisplay = document.getElementById('errorDisplay');
    errorDisplay.textContent = message;
}

// Clear error message
function clearError() {
    const errorDisplay = document.getElementById('errorDisplay');
    errorDisplay.textContent = '';
}

// Add city to dropdown and update recent cities list
function addCityToDropdown(city) {
    const recentCitiesButton = document.getElementById('recentCitiesButton');
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!cities.includes(city)) {
        cities.unshift(city); // Insert the city at the beginning of the array
        if (cities.length > 5) cities.pop(); // Ensure only last 5 cities are stored
        localStorage.setItem('recentCities', JSON.stringify(cities));
    }
    recentCitiesButton.classList.remove('hidden');
    renderRecentCities();
}


// Render recent cities in the dropdown
function renderRecentCities() {
    const recentCitiesList = document.getElementById('recentCitiesList');
    recentCitiesList.innerHTML = '';
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    cities.forEach(city => {
        const cityItem = document.createElement('div');
        cityItem.className = 'p-2 flex justify-between items-center hover:bg-gray-200';
        cityItem.innerHTML = `
            <span class="cursor-pointer">${city}</span>
            <button class="remove-city bg-red-500 text-white text-lg px-2 py-1 rounded ml-2">Remove</button>
        `;
        cityItem.querySelector('.cursor-pointer').addEventListener('click', async () => {
            clearError(); // Clear previous error message
            showLoading();
            const weatherData = await fetchWeather(city);
            if (weatherData) {
                displayWeather(weatherData);
                document.getElementById('cityInput').value = city;
            }
            hideLoading();
            recentCitiesList.classList.add('hidden');
        });
        cityItem.querySelector('.remove-city').addEventListener('click', (e) => {
            e.stopPropagation();
            removeCityFromDropdown(city);
        });
        recentCitiesList.appendChild(cityItem);
    });
}

// Remove city from dropdown
function removeCityFromDropdown(city) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    cities = cities.filter(c => c !== city);
    localStorage.setItem('recentCities', JSON.stringify(cities));
    renderRecentCities();
}

// Change background image based on city
async function changeBackgroundImage(city) {
    try {
        const url = `https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=${unsplashAccessKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].urls.regular;
            document.getElementById('dashboard').style.backgroundImage = `url(${imageUrl})`;
        } else {
            document.getElementById('dashboard').style.backgroundImage = '';
        }
    } catch (error) {
        console.error('Error fetching background image:', error);
    }
}

// Show loading spinner
function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

// Hide loading spinner
function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}
