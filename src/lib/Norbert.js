// @flow

import config from 'config';
import Client from 'node-irc';
import Plugin from 'plugins/Plugin';
import sqlite3 from 'sqlite3';

export default class Norbert {
    client:Client;
    db:sqlite3.Database;

    constructor() {
        let server:{hostname:string,port:string,nick:string,fullname:string,channels:[string]} = config.get('server');
        let temp = new Client(server.hostname, server.port, server.nick, server.fullname);

        temp.on('ready', () => {
            for(let channel of server.channels) {
                temp.join(channel);
            }
        });

        this.client = temp;
        this.db = new sqlite3.Database(config.get('database.location'));

        let plugins:[Plugin] = config.get('plugins');

        for(let plugin of plugins) {
            plugin.subscribe(this);
            plugin.init(this);
        }

        temp.connect();

    }

}