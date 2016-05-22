// @flow

import Plugin from 'plugins/Plugin';
import Norbert from 'lib/Norbert';

export default class SimpleChannelDaemonPlugin extends Plugin {
    constructor() {
        super();
        this.receiverMatches = this._buildMatcherRegexp(this.getChannels());
    }

    getChannels():[string] {
        return [];
    }

    getTriggers():[(word:string, sender:string, channel:string, idx?:number) => false|(channel:string, sender:string, message:string, client:Norbert,
        triggered:string)=>void] {
        throw new Error("This needs to be overriden.");
    }

    _buildMatcherRegexp(channels:[string]):RegExp {
        if(channels.length == 0) {
            return /#.*/;
        } else {
            const pattern = "#(" + channels.join(")|(") + ")";
            return new RegExp(pattern);
        }
    }

    subscribe(norbert:Norbert) {
        norbert.client.on('message', (from, to, message) => {
            if(to.match(this.receiverMatches)) {
                this.processChanMsg(to, from, message, norbert);
            }
        })
    }

    processChanMsg(channel:string, sender:string, message:string, client:Norbert) {
        const words = message.split(/\s+/);

        if(words.length == 0) {
            //not sure how this happened
            return;
        }

        let idx = 0;

        words.forEach((word) => {
            for(const matcher:Function of this.getTriggers()) {
                const parser = matcher.call(this, word, sender, channel, idx);

                if(parser !== false) {
                    parser.call(this, channel, sender, message, client, word);
                }
            }

            ++idx;
        });
    }
}