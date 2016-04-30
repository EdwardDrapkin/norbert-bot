// @flow

import Client from 'node-irc';

const EVENT_TOKEN = "CHANMSG|PRIVMSG|JOIN|INVITE|TOPIC|PART|KICK|QUIT|NICK";

export default class Plugin {
    receiverMatches: RegExp;

    constructor() {
        this.receiverMatches = /.*/;
    }

    subscribe(client:Client) {
        client.on('CHANMSG', (data) => {
            console.log(data);

            if(data.receiver.match(this.receiverMatches)) {
                this.processChanMsg(data.receiver, data.sender, data.message, client);
            }
        })
    }

    processChanMsg(channel, sender, message, client) {
        client.say(channel, `${sender} said ${message}`);
    }
}