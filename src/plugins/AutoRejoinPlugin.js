// @flow

import Norbert from 'lib/Norbert';
import Plugin from 'plugins/Plugin';

export default class AutoRejoinPlugin extends Plugin {
    sleep:number;

    constructor(sleep:number = 1000) {
        super();
        this.sleep = sleep;
    }

    getName() {
        return "AutoRejoin";
    }

    getHelp() {
        return {
            overview: "AutoRejoin when KICKed"
        }
    }

    subscribe(norbert:Norbert) {
        norbert.client.on('KICK', (channel, kicked) => {
            if(kicked == norbert.client.nick) {
                setTimeout(() => {
                    norbert.client.join(channel);
                }, this.sleep);
            }
        })
    }
}