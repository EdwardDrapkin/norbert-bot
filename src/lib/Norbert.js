// @flow

import config from 'config';
import Client from 'node-irc';
import Plugin from 'plugins/Plugin';
import sqlite3 from 'sqlite3';

export default class Norbert {
    client:Client;
    db:sqlite3.Database;
    meta:{
        prefix: string,
        version: string,
        name: string
    };
    helpData:{
        __commands: {
            [K:string]: string
        },
        [plugin:string] : {
            overview: string,
            commands: {
                [K:string]: string
            }
        }
    };

    constructor() {
        let server:{hostname:string,port:string,nick:string,fullname:string,channels:[string]} = config.get('server');
        let temp = new Client(server.hostname, server.port, server.nick, server.fullname);
        let plugins:[Plugin] = config.get('plugins');
        let pjson = require('../../package.json');

        this.client = temp;
        this.db = new sqlite3.Database(config.get('database.location'));
        this.helpData = {
            __commands: {}
        };

        this.meta = {
            prefix: config.get('preferences.prefix'),
            version: pjson.version,
            name: pjson.name
        };

        for(let plugin of plugins) {
            plugin.subscribe(this);
            plugin.init(this);
            this.addHelpData(plugin);
        }

        temp.on('ready', () => {
            for(let channel of server.channels) {
                temp.join(channel);
            }
        });

        temp.connect();
    }

    addHelpData(plugin:Plugin) {
        let name = plugin.getName();
        this.helpData[name] = plugin.getHelp();
        Object.assign(this.helpData['__commands'], plugin.getHelp().commands);
    }

}