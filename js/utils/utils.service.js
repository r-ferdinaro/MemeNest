'use strict';

function makeId(length = 6) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, length); 
}