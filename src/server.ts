'use strict';

import {ICity} from "./shared";
import {createServer, IncomingMessage, ServerResponse} from 'http';
import {parse} from 'url';
import {isEmpty} from 'lodash';
import {readdir, readFile} from './io';
import {buildHeader, citiesCache} from './shared';
import {get as getWeather} from './weather';

const PUBLIC_FOLDER = './src/public';
const DEFAULT_PUBLIC_RESOURCE = 'index.html';
const CITIES_FILE = 'cities.json';
const PORT = 8080;

const filesCache = new Map();

cacheFiles()
    .then(() =>
        createServer(handleRequest).listen(PORT, () => {
            console.log(`Client is available at http://localhost:${PORT}`);
        }));

// Cache all files in public folder (except *.ts and *.map)
async function cacheFiles() {
    const files: string[] = await readdir(PUBLIC_FOLDER);
    const readPromises: Array<Promise<string>> = [];
    files.forEach(file => {
        if (!/.*\.(ts|map)/.test(file)) {
            readPromises.push(readFile(`${PUBLIC_FOLDER}/${file}`)
                .then(data => filesCache.set(file, data))
                .catch(err => err)  // prevent breaking on rejection
            )
        }
    });
    await Promise.all(readPromises);
    JSON.parse(filesCache.get(CITIES_FILE))
        .forEach((city: ICity) => citiesCache.set(city.id, city));
}

function handleRequest(req: IncomingMessage, res: ServerResponse) {
    if (!req) {
        return;
    }
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

function handleGetRequest(req: IncomingMessage, res: ServerResponse) {
    let {path, query} = parseRequest(req);

    // weather/{cityId}
    let result = /\bweather\b\/(\d+)/i.exec(path);
    if (result) {
        getWeather(Number(result[1]))
            .then(data => {
                res.writeHead(200, buildHeader('*.json'));
                res.end(data);
            });
    } else if (path === 'weather' && query && query.city) {
        getWeather(<string>query.city)
            .then(data => {
                res.setHeader('Set-Cookie', [`weatherData=${data}`]);
                sendFile(res, DEFAULT_PUBLIC_RESOURCE);
            });
    } else {
        sendFile(res, path, query);
    }
}

function parseRequest(req: IncomingMessage) {
    const reqObj = parse(<string>req.url, true);
    const pathname = reqObj.pathname.trim('/').toLowerCase();

    return {
        path: pathname || DEFAULT_PUBLIC_RESOURCE,
        query: reqObj.query
    }
}

function sendFile(res: ServerResponse, fileName: string, query?: Object) {
    if (filesCache.has(fileName)) {
        res.writeHead(200, buildHeader(fileName));
        res.end(filterJSON(filesCache.get(fileName), query));
    } else {
        handleUncachedFileRequest(res, fileName, query);
    }
}

function handleUncachedFileRequest(res: ServerResponse, fileName: string, query?: Object) {
    readFile(`${PUBLIC_FOLDER}/${fileName}`)
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

function filterJSON(stringifiedJSON: string, filtersObj?: Object) {

    //#region Validations
    if (!filtersObj || isEmpty(filtersObj))
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
