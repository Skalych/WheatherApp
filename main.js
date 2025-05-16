const apiKey = "1cef12b3d230cebf7407fe390f612469";

const gradients = {
    morning: "linear-gradient(-45deg, #c9d6ff, #e2e2e2, #c9d6ff, #e2e2e2)",
    day: "linear-gradient(-45deg, #a1c4fd, #c2e9fb, #a1c4fd, #c2e9fb)",
    evening: "linear-gradient(-45deg, #fbc2eb, #a6c1ee, #fbc2eb, #a6c1ee)",
    night: "linear-gradient(135deg, #0f2027, #203a43, #2c5364, #4b6cb7)"
};

const translations = {
    ua: {
        placeholder: "Введіть місто",
        button: "Дізнатись погоду",
        labels: { humidity: "Вологість", pressure: "Тиск", wind: "Вітер" },
        errors: { notFound: "Місто не знайдено або помилка API." }
    },
    en: {
        placeholder: "Enter city",
        button: "Get Weather",
        labels: { humidity: "Humidity", pressure: "Pressure", wind: "Wind" },
        errors: { notFound: "City not found or API error." }
    }
};

let currentLang = "ua";

const cityInput = document.getElementById("cityInput");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const weatherCard = document.getElementById("weatherResult");
const weatherContent = document.getElementById("weatherContent");
const langToggleBtn = document.getElementById("langToggleBtn");
const geoBtn = document.getElementById("geoBtn");

// Бек в залежності від часу
function changeBackground(timeOfDay) {
    const body = document.body;
    const newLayer = document.createElement("div");
    newLayer.className = "background-layer";
    newLayer.style.background = gradients[timeOfDay];

    body.appendChild(newLayer);
    requestAnimationFrame(() => newLayer.classList.add("visible"));

    [...body.querySelectorAll(".background-layer")]
        .filter(el => el !== newLayer)
        .forEach(layer => {
            layer.classList.remove("visible");
            setTimeout(() => layer.parentNode?.removeChild(layer), 1600);
        });
}

// Оновлення placeholder
function updateTexts() {
    cityInput.placeholder = translations[currentLang].placeholder;
    getWeatherBtn.textContent = translations[currentLang].button;
}

// Апі погоди 
function fetchWeather(city) {
    if (!city) {
        weatherCard.classList.remove("show");
        weatherContent.innerHTML = "";
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${currentLang}`;

    weatherContent.classList.replace("fade-in", "fade-out");

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error(translations[currentLang].errors.notFound);
            return response.json();
        })
        .then(data => {
            const localTime = new Date(Date.now() + data.timezone * 1000);
            const hours = localTime.getUTCHours().toString().padStart(2, '0');
            const minutes = localTime.getUTCMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;

            const weatherEmoji = {
                Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
                Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Smoke: "💨",
                Haze: "🌫️", Dust: "🌪️", Fog: "🌫️", Sand: "🏜️",
                Ash: "🌋", Squall: "💨", Tornado: "🌪️"
            };

            let timeOfDay = "day";
            const hour = localTime.getUTCHours();
            if (hour >= 6 && hour < 12) timeOfDay = "morning";
            else if (hour >= 12 && hour < 18) timeOfDay = "day";
            else if (hour >= 18 && hour < 21) timeOfDay = "evening";
            else timeOfDay = "night";

            changeBackground(timeOfDay);

            const mainWeather = data.weather[0].main;
            const weatherIcon = weatherEmoji[mainWeather] || "";

            const weatherHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; font-weight:700; font-size:2rem; color:#fff;">${data.name}</h2>
                    <span style="font-size:1.8rem; font-weight:600; color:#eee;">${timeString}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                    <p style="margin:0; font-size:1.2rem; color:#ffdbd3; text-transform:capitalize; display:flex; align-items:center; gap:6px;">
                        <span>${weatherIcon}</span> ${data.weather[0].description}
                    </p>
                    <p style="margin:0; font-size:1.2rem; font-weight:600; color:#eee;">${data.main.temp} °C</p>
                </div>

                <p>💧 ${translations[currentLang].labels.humidity}: ${data.main.humidity}%</p>
                <p>🧭 ${translations[currentLang].labels.pressure}: ${data.main.pressure} hPa</p>
                <p>🌬️ ${translations[currentLang].labels.wind}: ${data.wind.speed} m/s</p>
            `;

            setTimeout(() => {
                weatherContent.innerHTML = weatherHTML;
                weatherContent.classList.replace("fade-out", "fade-in");
                weatherCard.classList.add("show");
            }, 300);
        })
        .catch(error => {
            setTimeout(() => {
                weatherContent.innerHTML = `<p style="color:red;"><strong>${error.message}</strong></p>`;
                weatherContent.classList.replace("fade-out", "fade-in");
                weatherCard.classList.add("show");
            }, 300);
        });
}

// Гео + лангуаге 
getWeatherBtn.addEventListener("click", () => {
    fetchWeather(cityInput.value.trim());
});

langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "ua" ? "en" : "ua";
    langToggleBtn.textContent = currentLang.toUpperCase();
    updateTexts();

    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
    else {
        weatherContent.innerHTML = "";
        weatherCard.classList.remove("show");
    }
});

geoBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        alert("Геолокація не підтримується вашим браузером");
        return;
    }

    geoBtn.disabled = true;
    geoBtn.textContent = "⌛";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&lang=${currentLang}`;

            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data && data.name) {
                        cityInput.value = data.name;
                        fetchWeather(data.name);
                    } else alert("Не вдалося визначити місто");

                    geoBtn.textContent = "📍";
                    geoBtn.disabled = false;
                })
                .catch(() => {
                    alert("Помилка при визначенні міста");
                    geoBtn.textContent = "📍";
                    geoBtn.disabled = false;
                });
        },
        (error) => {
            alert("Помилка доступу до геолокації: " + error.message);
            geoBtn.textContent = "📍";
            geoBtn.disabled = false;
        }
    );
});

// Ініціалізація
langToggleBtn.textContent = currentLang.toUpperCase();
updateTexts();
