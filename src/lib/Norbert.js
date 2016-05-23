// @flow

import config from 'config';
import {Client} from 'irc';
import Plugin from 'plugins/Plugin';
import sqlite3 from 'sqlite3';
import EventEmitter from 'events';

export default class Norbert {
    client:(Client & EventEmitter.EventEmitter);

    db:sqlite3.Database;

    loaded: { [plugin:string] : true };

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
            commands?: {
                [K:string]: string
            }
        }
    };

    constructor() {
        this.setupDatabase();
        this.setupClient();

        const plugins:[Plugin] = config.get('plugins');
        const pjson = require('../../package.json');

        this.loaded = {};

        this.helpData = {
            __commands: {}
        };

        this.meta = {
            prefix: config.get('preferences.prefix'),
            version: pjson.version,
            name: pjson.name
        };

        for(const plugin of plugins) {
            this.loadPlugin(plugin);
        }
    }

    loadPlugin(plugin:Plugin) {
        plugin.init(this);
        plugin.subscribe(this);
        this.addHelpData(plugin);
        this.loaded[plugin.getName()] = true;
    }

    setupClient() {
        const server:{hostname:string,port:string,nick:string,fullname:string,channels:string} = config.get('server');

        const temp = new Client(server.hostname, server.nick, {
            realName: server.fullname,
            debug: true,
            channels: server.channels.split(',').map(e=>e.trim())
        });

        temp.debug = true;
        temp.setMaxListeners(1000);

        temp.on('error', (e) => {
            console.error(e);
        });

        this.client = temp;
    }

    setupDatabase() {
        this.db = new sqlite3.Database(config.get('database.location'));
        console.info("Startup DB vacuum, this may take a moment.");
        this.db.run("VACUUM");
        console.info("Vacuuming finished.  Thanks for your patience!");
        this.db.run("PRAGMA auto_vacuum = 1;"); // FULL auto vacuum because we VACUUM on start
        this.db.run("PRAGMA cache_size = -8096;"); //default size is 2000kB, const's increase that
        this.db.run("PRAGMA journal_mode = TRUNCATE;"); //default size is DEconstE, docs say this should be faster
        this.db.run("PRAGMA threads = 2;"); //allow up to 2 worker threads instead of the usual 0

    }

    addHelpData(plugin:Plugin) {
        const name = plugin.getName();
        const help = plugin.getHelp();

        //this is ugly but it allows convenience for plugin devs
        if(!help.hasOwnProperty('commands')) {
            help.commands = {};
        }

        this.helpData[name] = help;
        Object.assign(this.helpData['__commands'], help.commands);
    }

    hasPlugin(plugin:string) {
        return this.loaded.hasOwnProperty(plugin) && this.loaded[plugin] === true;
    }
}