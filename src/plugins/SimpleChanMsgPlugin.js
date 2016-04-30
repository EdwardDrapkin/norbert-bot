// @flow

import Plugin from 'plugins/Plugin';
import Client from 'node-irc';

export default class SimpleChanMsgPlugin extends Plugin {
    constructor() {
        super();
        this.receiverMatches = this._buildMatcherRegexp(this.getChannels());
    }

    getChannels() {
        return [];
    }

    getTrigger() {
        return "!";
    }

    getCommands() {
        return {
            test: (channel, sender, message, client) => {
                client.say(channel, `${sender} said ${message}`);
            }
        }
    }

    _buildMatcherRegexp(channels:[string]) {
        if(channels.length == 0) {
            return '#.*';
        } else {
            let pattern = "#(" + channels.join(")|(") + ")";
            return new RegExp(pattern);
        }
    }

    subscribe(client:Client) {
        client.on('CHANMSG', (data) => {
            if(data.receiver.match(this.receiverMatches)) {
                if(data.message.charAt(0) === this.getTrigger()) {
                    this.processChanMsg(data.receiver, data.sender, data.message, client);
                }
            }
        })
    }

    processChanMsg(channel, sender, message, client) {
        let words = message.split(/\s+/);

        if(words.length == 0) {
            //not sure how this happened
            return;
        }

        let command = words.shift().substr(1);
        let commands = this.getCommands();

        if(commands.hasOwnProperty(command)) {
            commands[command].call(this, channel, sender, words.join(' '), client);
        }


    }
}