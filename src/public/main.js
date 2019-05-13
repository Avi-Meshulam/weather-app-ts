'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const serverUrl = 'http://localhost:8080';
const CITY_ZOOM = 10;
const DEFAULT_CITY_MARKER_ICON = Icons.blueIcon;
const WEATHER_CACHE_EXPIRATION_TIME = 60 * 60000; // 60 minutes
const citiesCache = new Map();
const weatherCache = new Map();
const markersCache = new Map();
const map = initMap('map-section');
const citiesListElement = document.querySelector('#cities-list');
const weatherElement = document.querySelector('#weather-section');
let selectedCity;
// Add startup page to navigation history
if (!window.history.state) {
    window.history.replaceState(-1, '', serverUrl);
}
// this event is triggered when the user clicks the browser's back and forward buttons
window.onpopstate = function (e) {
    if (Number.isInteger(e.state) && citiesListElement.selectedIndex !== e.state) {
        citiesListElement.selectedIndex = e.state;
        citiesListElement.dispatchEvent(new Event("change"));
    }
};
document.querySelector('#data-section #btnReset').addEventListener('click', function () {
    if (citiesListElement.selectedIndex !== -1) {
        citiesListElement.selectedIndex = -1;
        citiesListElement.dispatchEvent(new Event("change"));
    }
});
getData(`${serverUrl}/cities.json`)
    .then(cities => {
    cities.sort((c1, c2) => sortTypes.caseInsensitive(c1.name, c2.name));
    renderCitiesList(cities);
    handleWeatherCookie();
})
    .catch(err => console.error(err));
function getData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fetch(url).catch(err => err);
        return data.json();
    });
}
function renderCitiesList(cities) {
    if (!cities || cities.length === 0) {
        return;
    }
    const citiesFragment = document.createDocumentFragment();
    cities.forEach(city => {
        addCityMarker(city);
        citiesFragment.appendChild(createCityElement(city));
    });
    citiesListElement.removeChildren();
    citiesListElement.appendChild(citiesFragment);
    citiesListElement.onchange = selectedCityChanged;
    citiesListElement.selectedIndex = -1;
}
function addCityMarker(city, icon = DEFAULT_CITY_MARKER_ICON) {
    const marker = L.marker([city.coord.lat, city.coord.lon], { title: city.name, icon: icon });
    // marker.cityId = city.id;
    Object.defineProperty(marker, 'cityId', { value: city.id });
    marker.on('click', cityMarkerClicked);
    marker.addTo(map);
    markersCache.set(city, marker);
}
function cityMarkerClicked(e) {
    if (citiesListElement.value != e.target.cityId) {
        citiesListElement.value = e.target.cityId;
        citiesListElement.dispatchEvent(new Event("change"));
    }
}
function createCityElement(city) {
    const cityElement = document.createElement('option');
    cityElement.innerHTML = city.name;
    cityElement.value = city.id;
    citiesCache.set(city.id, city);
    return cityElement;
}
function selectedCityChanged(e) {
    if (selectedCity) {
        markersCache.get(selectedCity).setIcon(Icons.blueIcon);
    }
    const cityId = Number(e.target.value);
    selectedCity = cityId ? citiesCache.get(cityId) : undefined;
    if (window.history.state !== e.target.selectedIndex) {
        window.history.pushState(e.target.selectedIndex, '', `${serverUrl}${selectedCity ? `/weather?city=${selectedCity.name},${selectedCity.country}` : ''}`);
    }
    if (selectedCity) {
        markersCache.get(selectedCity).setIcon(Icons.redIcon);
        map.flyTo([selectedCity.coord.lat, selectedCity.coord.lon], CITY_ZOOM);
    }
    else {
        // @ts-ignore
        map.fitWorld({ reset: true }).zoomIn();
    }
    updateWeatherInfo();
}
function updateWeatherInfo(city = selectedCity) {
    if (!city) {
        renderWeatherData();
        return;
    }
    if (weatherCache.has(city.id)) {
        const weatherData = weatherCache.get(city.id);
        if (Date.now() - weatherData.lastModified <= WEATHER_CACHE_EXPIRATION_TIME) {
            renderWeatherData(weatherData);
            return;
        }
    }
    // If data does not exist in cache or if it's expired => fetch data from server
    getData(`${serverUrl}/weather/${city.id}`)
        .then(weatherObj => {
        weatherObj.lastModified = Date.now();
        weatherCache.set(city.id, weatherObj);
        renderWeatherData(weatherObj);
    })
        .catch(err => console.error(err));
}
function renderWeatherData(data) {
    if (data) {
        weatherElement.querySelector('#description').innerHTML = data.weather[0].description;
        weatherElement.querySelector('#wind').innerHTML = `speed ${data.wind.speed}, ${data.wind.deg} degrees`;
        weatherElement.querySelector('#temperature').innerHTML = data.main.temp;
        weatherElement.querySelector('#humidity').innerHTML = `${data.main.humidity}%`;
    }
    else {
        weatherElement.querySelectorAll('.data-field').forEach(elem => elem.innerHTML = '');
    }
}
function initMap(mapElementId) {
    const map = L.map(mapElementId);
    map.setView([0, 0], 1);
    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=f5LbbrtwrAG63SgNdh3Q', {
        attribution: `<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a>
    <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>`,
    }).addTo(map);
    map.fitWorld().zoomIn();
    return map;
}
// if the client asks for weather data through url,
// server responds with a cookie of weather data.
function handleWeatherCookie() {
    // if document.cookie contains weatherData => render it!
    const weatherData = document.cookie.replace(/(?:(?:^|.*;\s*)weatherData\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (weatherData) {
        const weatherObj = JSON.parse(weatherData);
        weatherObj.lastModified = Date.now();
        const cityId = weatherObj.id;
        weatherCache.set(cityId, weatherObj);
        citiesListElement.value = cityId;
        citiesListElement.dispatchEvent(new Event("change"));
        // Delete weatherData value from cookie
        document.cookie = 'weatherData=;';
    }
}
//# sourceMappingURL=main.js.map