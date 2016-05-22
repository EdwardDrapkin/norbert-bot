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
            overview: "AutoRejoin when KICKed",
            commands: {

            }
        }
    }

    subscribe(norbert:Norbert) {
        norbert.client.on('KICK', (data) => {
            const channel = data.receiver;
            const kicker = data.snder;
            const kicked = data.message[0];
            const kickMsg = data.message[1];

            if(kicked == norbert.client.nickname) {
                setTimeout(() => {
                    norbert.client.join(channel);
                }, this.sleep);
            }
        })
    }
}