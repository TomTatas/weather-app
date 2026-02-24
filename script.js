const apiKey = "16d9e7525b075f2b6e86da73f5459394";

const input = document.getElementById("cityInput");
const btn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const themeToggle = document.getElementById("themeToggle");

const weatherBox = document.getElementById("weatherBox");
const forecastBox = document.getElementById("forecast");
const error = document.getElementById("error");

const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const feelsEl = document.getElementById("feels");
const descEl = document.getElementById("desc");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("icon");

btn.addEventListener("click", () => getWeather(input.value));
geoBtn.addEventListener("click", getLocation);
input.addEventListener("keypress", e => {
  if (e.key === "Enter") getWeather(input.value);
});

document.addEventListener("DOMContentLoaded", () => {
  const lastCity = localStorage.getItem("lastCity");
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.className = savedTheme;
  if (lastCity) getWeather(lastCity);
});

themeToggle.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
  document.body.className = newTheme;
  localStorage.setItem("theme", newTheme);
});

async function getWeather(city) {
  if (!city) return;

  try {
    error.textContent = "";

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    cityEl.textContent = `${data.name}, ${data.sys.country}`;
    iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    tempEl.textContent = `🌡 ${data.main.temp}°C`;
    feelsEl.textContent = `Feels like: ${data.main.feels_like}°C`;
    descEl.textContent = data.weather[0].description;
    humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
    windEl.textContent = `Wind: ${data.wind.speed} m/s`;

    weatherBox.classList.remove("hidden");

    localStorage.setItem("lastCity", city);

    getForecast(city);

  } catch {
    error.textContent = "City not found or API error";
  }
}

async function getForecast(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
  );
  const data = await res.json();

  forecastBox.innerHTML = "";
  forecastBox.classList.remove("hidden");

  const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  daily.slice(0, 5).forEach(day => {
    const card = document.createElement("div");
    card.classList.add("forecast-card");

    const date = new Date(day.dt_txt).toLocaleDateString();

    card.innerHTML = `
      <p>${date}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" />
      <p>${day.main.temp}°C</p>
    `;

    forecastBox.appendChild(card);
  });
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(async position => {
    const { latitude, longitude } = position.coords;

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
    );

    const data = await res.json();
    getWeather(data.name);
  });
}