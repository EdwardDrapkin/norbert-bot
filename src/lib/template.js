// @flow

import compile from 'string-template/compile';

function getCurrent(name) {
    const names = name.split('.');

    let n;
    let current = template.prototype.strings;

    while(n = names.shift()) {
        current = current[n];
    }

    return current;
}

const template = function(name:string, ...args:any) : string {
    if(!template.prototype.strings) {
        template.prototype.strings = {};
    }

    if(!template.prototype.loaded.hasOwnProperty(name)) {
        template.prototype.loaded[name] = compile(getCurrent(name));
    }

    return template.prototype.loaded[name](...args);
};


template.prototype.loaded = {};
export function getObject(name:string) : Object {
    return getCurrent(name);
}

template.getObject = getObject;

export default template;