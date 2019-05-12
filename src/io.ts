'use strict';

import * as fs from 'fs';

// Promisified version of fs.readdir
const readdir = (dir:string):Promise<string[]> =>
    new Promise((resolve, reject) => {
        fs.readdir(dir, (err: any, files: string[]) => err ? reject(err) : resolve(files));
    });

// Promisified version of fs.readFile
const readFile = (file:string):Promise<string> =>
    new Promise((resolve, reject) => {
        fs.readFile(file, (err: any, data: Buffer) => err ? reject(err) : resolve(data.toString()));
    });

export {readdir, readFile};
