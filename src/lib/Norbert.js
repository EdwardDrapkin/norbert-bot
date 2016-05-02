// @flow

import config from 'config';
import irc from 'irc';
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
        let server:{hostname:string,port:string,nick:string,fullname:string,channels:string} = config.get('server');
        let temp = new irc.Client(server.hostname, server.nick, {
            realName: server.fullname,
            username: 'norbert',
            debug: true,
            channels: server.channels.split(',').map(e=>e.trim())
        });
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

        temp.on('error', (e) => {
            console.log(e);
        });

        temp.debug = true;

        temp.connect();
    }

    addHelpData(plugin:Plugin) {
        let name = plugin.getName();
        this.helpData[name] = plugin.getHelp();
        Object.assign(this.helpData['__commands'], plugin.getHelp().commands);
    }

}