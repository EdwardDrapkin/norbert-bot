// @flow

import config from 'config';
import Client from 'node-irc';

export default class Norbert {
    client:Client;

    constructor() {
        let server:{hostname:string,port:string,nick:string,fullname:string,channels:[string]} = config.get('server');
        let temp = new Client(server.hostname, server.port, server.nick, server.fullname);

        temp.on('ready', () => {
            for(let channel of server.channels) {
                temp.join(channel);
            }
        });

        temp.connect();

        this.client = temp;
    }
}