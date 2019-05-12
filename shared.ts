'use strict';

// Trims leading and trailing input string parameter
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
['txt', ''].forEach(ext => contentTypes.set(ext, 'text/plain'));
['gif', 'png', 'jpg'].forEach(ext => contentTypes.set(ext, `image/${ext}`));

// return Content-Type http attribute according to file's extension
function getContentType(fileName = '.') {
    const fileExt = fileName.split('.')[1].toLowerCase() || '';
    return contentTypes.get(fileExt);
}

// append parameters to a base url
function buildUrl(baseUrl, ...params) {
    return params.reduce((p1, p2) => p1 + `&${p2}`, baseUrl);
}

function mergeObjects(...objects) {
    return objects.reduce((obj1, obj2) => Object.assign({ ...obj1 }, { ...obj2 }));
}

function buildHeader(fileName, ...objects) {
    return mergeObjects({'Content-Type': getContentType(fileName)}, ...objects)
}

module.exports = {buildHeader, buildUrl, citiesCache};
