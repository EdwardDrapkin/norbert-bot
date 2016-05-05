// @flow

import Norbert from 'lib/Norbert';

export default class Plugin {
    receiverMatches:RegExp;
    hasPlugin:(plugin:string) => boolean;

    constructor() {
        this.receiverMatches = /.*/;
        this.hasPlugin = (x) => false;
    }


    init(norbert:Norbert) {
        this.hasPlugin = norbert.hasPlugin.bind(norbert);
    }

    reset(norbert:Norbert) {}
    subscribe(norbert:Norbert) {}

    requirePlugin(...plugins:Array<string>) {
        plugins.forEach(plugin => {
            if(!this.hasPlugin(plugin)) {
                throw new Error(`${plugin} not loaded.`);
            }
        });
    }

    getHelp() : {
        overview: string,
        commands?: {
            [K:string]: string
        }
    } {
        throw new Error("this needs to be overriden.");
    }

    getName():string {
        throw new Error("this needs to be overriden.");
    }
}