// @flow

import Plugin from 'plugins/Plugin';
import Norbert from 'lib/Norbert';

export default class SimpleChanMsgPlugin extends Plugin {
    trigger:string;
    _commands:{[k: string]:Function};

    constructor() {
        super();
        this.receiverMatches = this._buildMatcherRegexp(this.getChannels());
        this._commands = this._getCommands();
    }

    getChannels() : [string] {
        return [];
    }

    getTrigger() : string {
        return this.trigger ? this.trigger : '!';
    }

    getCommands() : { [k: string]:Function } {
        throw new Error("This needs to be overriden.");
    }

    _buildMatcherRegexp(channels:[string]) : RegExp {
        if(channels.length == 0) {
            return /#.*/;
        } else {
            let pattern = "#(" + channels.join(")|(") + ")";
            return new RegExp(pattern);
        }
    }

    _getCommands() {
        let temp = {};

        Object.keys(this.getCommands()).forEach(key => {
            temp[key.toLowerCase()] = this.getCommands()[key]
        });

        return temp;
    }


    init(norbert:Norbert) {
        super.init(norbert);
        this.trigger = norbert.meta.prefix;
    }

    subscribe(norbert:Norbert) {
        norbert.client.on('message', (from, to, message) => {
            if(to.match(this.receiverMatches)) {
                if(message.charAt(0) === this.getTrigger()) {
                    this.processChanMsg(to, from, message, norbert);
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

        let command = words.shift().substr(1).toLowerCase();

        if(this._commands.hasOwnProperty(command)) {
            this._commands[command].call(this, channel, sender, words.join(' '), client);
        }


    }
}