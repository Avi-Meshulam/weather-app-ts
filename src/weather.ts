'use strict';

import fetch from 'node-fetch';
import {buildUrl, citiesCache} from './shared';

interface IWeather {
    id: number;
}

const API_TOKEN = '5d96fcae82ff1063cf7e1c1f78882d73';
const serverUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${API_TOKEN}`;
const WEATHER_CACHE_EXPIRATION_TIME = 60 * 60000; // 60 minutes

const url = buildUrl.bind(null, serverUrl);
const weatherCache = new Map();

function get(key: number | string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        if (weatherCache.has(key)) {
            const weatherObj = weatherCache.get(key);
            if (Date.now() - weatherObj.lastModified <= WEATHER_CACHE_EXPIRATION_TIME) {
                resolve(weatherObj.weather);
                return;
            }
        }

        fetchWeather(key)
            .then(weather => {
                const city = citiesCache.get(weather.id);
                // cache data by both city-id key and {city-name, country} key
                weatherCache.set(city.id, {weather, lastModified: Date.now()});
                weatherCache.set(`${city.name},${city.country}`.toLowerCase(), {weather, lastModified: Date.now()});
                resolve(JSON.stringify(weather));
            })
            .catch(err => reject(err))
    });
}

function fetchWeather(key: number | string): Promise<IWeather> {
    const queryString = typeof key === 'number' ? `id=${key}` : `q=${key}`;
    return new Promise((resolve, reject) => {
        fetch(url(queryString))
            .then(res => res.json())
            .then(weatherObj => resolve(weatherObj.list ? weatherObj.list[0] : weatherObj))
            .catch(err => reject(err));
    });
}

export {get};
