// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';
import template from 'lib/template';

export default class PoopPlugin extends SimpleChanMsgPlugin {
    getName() {
        return "Poop";
    }

    getHelp() {
        return template.getObject('Poop.help');
    }

    getCommands() {
        return {
            poop: this.poop.bind(this)
        }
    }

    poop(channel:string, sender:string, message:string, norbert:Norbert) {
        norbert.client.say(channel, template('Poop.emoji'));
    }
}
