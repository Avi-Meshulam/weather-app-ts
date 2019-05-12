'use strict';

const fetch = require('node-fetch');
const buildUrl = require('./shared').buildUrl;
const citiesCache = require('./shared').citiesCache;

const API_TOKEN = '5d96fcae82ff1063cf7e1c1f78882d73';
const serverUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${API_TOKEN}`;
const WEATHER_CACHE_EXPIRATION_TIME = 60 * 60000; // 60 minutes

const url = buildUrl.bind(null, serverUrl);
const weatherCache = new Map();

async function getByCityId(cityId) {
    return new Promise((resolve, reject) => {
        if (weatherCache.has(cityId)) {
            const weatherObj = weatherCache.get(cityId);
            if (Date.now() - weatherObj.lastModified <= WEATHER_CACHE_EXPIRATION_TIME) {
                resolve(weatherObj.weather);
                return;
            }
        }

        fetch(url(`id=${cityId}`))
            .then(res => res.text())
            .then(weather => {
                weatherCache.set(cityId, {weather, lastModified: Date.now()});
                const city = citiesCache.get(cityId);
                const key = `${city.name},${city.country}`.toLowerCase();
                weatherCache.set(key, {weather, lastModified: Date.now()});
                resolve(weather);
            })
            .catch(err => reject(err));
    })
}

async function getByCityName(city, country) {
    const key = `${city},${country}`.toLowerCase();

    return new Promise((resolve, reject) => {
        if (weatherCache.has(key)) {
            const weatherObj = weatherCache.get(key);
            if (Date.now() - weatherObj.lastModified <= WEATHER_CACHE_EXPIRATION_TIME) {
                resolve(weatherObj.weather);
                return;
            }
        }

        fetch(url(`q=${key}`))
            .then(res => res.text())
            .then(data => {
                const weatherObj = JSON.parse(data);
                const weather = weatherObj.list ? JSON.stringify(weatherObj.list[0]) : data;
                const cityId = weatherObj.list ? weather.list[0].id : weatherObj.id;
                weatherCache.set(key, {weather, lastModified: Date.now()});
                weatherCache.set(cityId, {weather, lastModified: Date.now()});
                resolve(weather);
            })
            .catch(err => reject(err));
    })
}

module.exports = {getByCityId, getByCityName};
