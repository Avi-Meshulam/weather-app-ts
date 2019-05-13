'use strict';

import {OutgoingHttpHeaders} from "http";

interface ICity {
    id: number;
}

declare global {
    interface String {
        trim(str: string): string;
    }
}

// Trims leading and trailing occurrences of input parameter
String.prototype.trim = function (str = ' ') {
    const regExp = new RegExp(`^(${str})+|(${str})+$`, 'g');
    return this.replace(regExp, '');
};

const citiesCache = new Map();

const contentTypes = new Map();
contentTypes.set('json', 'application/json');
contentTypes.set('ico', 'image/x-icon');
contentTypes.set('js', 'text/javascript');
['html', 'css'].forEach(ext => contentTypes.set(ext, `text/${ext}`));
['txt', '', undefined, null].forEach(ext => contentTypes.set(ext, 'text/plain'));
['gif', 'png', 'jpg'].forEach(ext => contentTypes.set(ext, `image/${ext}`));

// return Content-Type http attribute according to file's extension
function getContentType(fileName = '.'): string {
    const fileExt = fileName.split('.')[1].toLowerCase() || '';
    return contentTypes.has(fileExt) ? contentTypes.get(fileExt) : contentTypes.get(undefined);
}

// append parameters to a base url
function buildUrl(baseUrl: string, ...params: string[]): string {
    return params.reduce((p1, p2) => p1 + `&${p2}`, baseUrl);
}

function mergeObjects(...objects: Object[]): Object {
    return objects.reduce((obj1, obj2) => Object.assign({ ...obj1 }, { ...obj2 }));
}

function buildHeader(fileName?:string, ...objects:Object[]): OutgoingHttpHeaders {
    return <OutgoingHttpHeaders>mergeObjects({'Content-Type': getContentType(fileName)}, ...objects)
}

export {ICity, buildHeader, buildUrl, citiesCache};
