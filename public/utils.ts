'use strict';

HTMLElement.prototype.removeChildren = function() {
    while (this.firstChild) {
        this.removeChild(this.firstChild);
    }
};

// enum of sort algorithms
const sortTypes = {
    caseInsensitive: (a, b) =>
        a.localeCompare(b, undefined, {sensitivity: 'base'})
};

export {sortTypes};
