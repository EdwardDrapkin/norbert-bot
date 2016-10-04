// @flow

import config from 'config';
import {Client} from 'irc';
import Plugin from 'plugins/Plugin';
import sqlite3 from 'sqlite3';
import EventEmitter from 'events';
import Logger from 'bunyan';
import path from 'path';
import template from 'lib/template';
import express from 'express';

export default class Norbert {
    client:(Client & EventEmitter.EventEmitter);

    db:sqlite3.Database;

    loaded:{ [plugin:string] : true } = {};
    plugins:{ [plugin:string] : Plugin } = {};

    express: Object;

    meta:{
        prefix: string,
        version: string,
        name: string,
        strings: Object
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
    } = {
        __commands: {}
    };

    logger:Logger;

    constructor() {
        this.setupExpress();
        this.setupDatabase();
        this.setupClient();

        const plugins:[Plugin] = config.get('plugins');
        const pjson = require('../../package.json');

        this.meta = {
            prefix: config.get('preferences.prefix'),
            version: pjson.version,
            name: pjson.name,
            strings: config.get('strings')
        };

        template.prototype.strings = this.meta.strings;

        this.getLogger().info({meta: this.meta}, "Norbert startup.");

        this.getLogger().info(`Attempting to load ${plugins.length} plugins`);

        for(const plugin of plugins) {
            this.loadPlugin(plugin);
        }
    }

    loadPlugin(plugin:Plugin) {
        this.getLogger().trace("Initializing plugin: " + plugin.getName());
        plugin.init(this);
        plugin.subscribe(this);
        this.addHelpData(plugin);

        this.loaded[plugin.getName()] = true;
        this.plugins[plugin.getName()] = plugin;
    }

    getLogger(plugin:Plugin|false = false) {
        if(!this.logger) {
            this._getLogger();
        }

        if(!plugin) {
            return this.logger;
        } else {
            return this.logger.child({plugin});
        }
    }

    _getLogger() {
        const level = config.get('logging.level').toString().toLowerCase();
        let filename = path.resolve(config.get('logging.directory') + "/norbert.log");

        const streams:[Object] = [
            {
                path: filename,
                level: level
            }
        ];

        switch(level) {
            case 'info':
            case 'debug':
            case 'trace':
                streams.push({
                    stream: process.stdout,
                    level: level
                });
        }

        this.logger = Logger.createLogger({
            name: 'norbert',
            streams: streams,
            serializers: {
                plugin: plugin => {
                    return {
                        name: plugin.getName(),
                        ctor: plugin.constructor.name
                    }
                }
            }
        });
    }

    setupClient() {
        const server: {
            hostname:string,
            port:string,
            nick:string,
            fullname:string,
            channels:string,
            sasl?:boolean,
            userName:string,
            password: string
        } = config.get('server');

        this.getLogger().info({server}, "Norbert client startup.");

        const params : {[k: string] : any} = {
            realName: server.fullname,
            debug: true,
            channels: server.channels.split(',').map(e=>e.trim()),
            floodProtection: true
        };

        if(server.sasl) {
            params.sasl = true;
            params.userName = server.userName;
            params.password = server.password;
        }

        const temp = new Client(server.hostname, server.nick, params);

        temp.debug = true;
        temp.setMaxListeners(1000);

        temp.on('error', (e) => {
            this.getLogger().error({error: e}, "IRC client error");
        });

        this.client = temp;
    }

    setupExpress() {
        const port = config.get('express.port', '12345');

        this.getLogger().trace("Initializing express");
        this.express = express();
        this.express.listen(port, () => {
            this.getLogger().trace(`Express listening on port ${port}`);
        });
    }

    setupDatabase() {
        this.getLogger().trace("Initializing sqlite");

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