'use strict';

const fs = require('fs');

// Promisified version of fs.readdir
const readdir = dir =>
    new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => err ? reject(err) : resolve(files));
    });

// Promisified version of fs.readFile
const readFile = file =>
    new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => err ? reject(err) : resolve(data));
    });

module.exports = {readdir, readFile};
