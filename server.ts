'use strict';

const http = require('http');
const url = require('url');
const _ = require('lodash');
const io = require('./io');
const buildHeader = require('./shared').buildHeader;
const citiesCache = require('./shared').citiesCache;
const getWeatherByCityId = require('./weather').getByCityId;
const getWeatherByCityName = require('./weather').getByCityName;

const PUBLIC_FOLDER = 'public';
const DEFAULT_PUBLIC_RESOURCE = 'index.html';
const CITIES_FILE = 'cities.json';
const PORT = 8080;

const filesCache = new Map();

cacheFiles()
    .then(() =>
        http.createServer(handleRequest).listen(PORT, () => {
            console.log(`Client is available at http://localhost:${PORT}`);
        }));

// Cache all files in public folder
async function cacheFiles() {
    const files = await io.readdir(PUBLIC_FOLDER);
    const readPromises = [];
    files.forEach(file =>
        readPromises.push(io.readFile(`${PUBLIC_FOLDER}/${file}`)
            .then(data => filesCache.set(file, data))
            .catch(err => err)  // prevent breaking on rejection
        ));
    await Promise.all(readPromises);
    JSON.parse(filesCache.get(CITIES_FILE))
        .forEach(city => citiesCache.set(city.id, city));
}

function handleRequest(req, res) {
    switch (req.method.toUpperCase()) {
        case 'OPTIONS':
            res.writeHead(200);
            res.end();
            break;
        case 'GET':
            handleGetRequest(req, res);
            break;
        default:
            break;
    }
}

function handleGetRequest(req, res) {
    let {path, query} = parseRequest(req);

    // weather/{cityId}
    let result = /\bweather\b\/(\d+)/i.exec(path);
    if (result) {
        getWeatherByCityId(Number(result[1]))
            .then(data => {
                res.writeHead(200, buildHeader('*.json'));
                res.end(data);
            });
    } else if (path === 'weather' && query && query.city) {
        const [city, country] = query.city.split(',');
        getWeatherByCityName(city, country)
            .then(data => {
                res.setHeader('Set-Cookie', [`weatherData=${data}`]);
                sendFile(res, DEFAULT_PUBLIC_RESOURCE);
            });
    } else {
        sendFile(res, path, query);
    }
}

function parseRequest(req) {
    const reqObj = url.parse(req.url, true);
    const pathname = reqObj.pathname.trim('/').toLowerCase();

    return {
        path: pathname || DEFAULT_PUBLIC_RESOURCE,
        query: reqObj.query
    }
}

function sendFile(res, fileName, query) {
    if (filesCache.has(fileName)) {
        res.writeHead(200, buildHeader(fileName));
        res.end(filterJSON(filesCache.get(fileName), query));
    } else {
        handleNewFileRequest(res, fileName, query);
    }
}

function handleNewFileRequest(res, fileName, query) {
    io.readFile(`${PUBLIC_FOLDER}/${fileName}`)
        .then(data => {
            filesCache.set(fileName, data);
            res.writeHead(200, buildHeader(fileName));
            res.write(filterJSON(data, query));
        })
        .catch(err => {
            let status = err.code === 'ENOENT' ? 404 : 500;
            res.writeHead(status, buildHeader());
            res.write(err.message);
        })
        .finally(() =>
            res.end());
}

function filterJSON(stringifiedJSON, filtersObj) {

    //#region Validations
    if (!filtersObj || _.isEmpty(filtersObj))
        return stringifiedJSON;

    // is JSON structure?
    let parsedJSON;
    try {
        parsedJSON = JSON.parse(stringifiedJSON);
    } catch (error) {
        return stringifiedJSON;
    }

    // is Array?
    if (!Array.isArray(parsedJSON))
        parsedJSON = [parsedJSON];
    //#endregion

    return JSON.stringify(parsedJSON.filter(item => {
        for (const key in filtersObj) {
            if (Object.prototype.hasOwnProperty.call(filtersObj, key)) {
                // deliberately using != and not !== in order to allow implicit conversion when needed
                if (item[key] != filtersObj[key]) {
                    return false;
                }
            }
        }
        return true;
    }));
}
