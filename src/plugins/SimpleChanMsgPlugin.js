// @flow

import Plugin from 'plugins/Plugin';
import Norbert from 'lib/Norbert';

export default class SimpleChanMsgPlugin extends Plugin {
    trigger:string;

    constructor() {
        super();
        this.receiverMatches = this._buildMatcherRegexp(this.getChannels());
    }

    getChannels() : [string] {
        return [];
    }

    getTrigger() : string {
        return this.trigger ? this.trigger : '!';
    }

    getCommands() : { [k: string]:Function } {
        return {
            test: (channel, sender, message, client) => {
                client.say(channel, `${sender} said ${message}`);
            }
        }
    }

    _buildMatcherRegexp(channels:[string]) : RegExp {
        if(channels.length == 0) {
            return /#.*/;
        } else {
            let pattern = "#(" + channels.join(")|(") + ")";
            return new RegExp(pattern);
        }
    }


    init(norbert:Norbert) {
        this.trigger = norbert.meta.prefix;
    }

    subscribe(norbert:Norbert) {
        norbert.client.on('CHANMSG', (data) => {
            if(data.receiver.match(this.receiverMatches)) {
                if(data.message.charAt(0) === this.getTrigger()) {
                    this.processChanMsg(data.receiver, data.sender, data.message, norbert);
                }
            }
        })
    }

    processChanMsg(channel:string, sender:string, message:string, client:Norbert) {
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