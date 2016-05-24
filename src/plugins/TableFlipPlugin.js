// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';
import template from 'lib/template';
import flip from 'flip-text';

export default class TableFlipPlugin extends SimpleChanMsgPlugin {
    getName() {
        return "TableFlip";
    }

    getHelp() {
        return template.getObject('TableFlip.help');
    }

    getCommands() {
        return {
            flip: this.flip.bind(this)
        }
    }

    flip(channel:string, sender:string, message:string, norbert:Norbert) {
        norbert.client.say(channel, template('TableFlip.flipper', {message: flip(message)} ));
    }
}