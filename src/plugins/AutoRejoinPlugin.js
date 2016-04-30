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
            let channel = data.receiver;
            let kicker = data.snder;
            let kicked = data.message[0];
            let kickMsg = data.message[1];

            if(kicked == norbert.client.nickname) {
                setTimeout(() => {
                    norbert.client.join(channel);
                }, this.sleep);
            }
        })
    }
}