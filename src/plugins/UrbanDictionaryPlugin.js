// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';
import template from 'lib/template';
import urban from 'urban';

export default class UrbanDictionaryPlugin extends SimpleChanMsgPlugin {
    getName() {
        return "UrbanDictionary";
    }

    getHelp() {
        return template.getObject('UrbanDictionary.help');
    }

    getCommands() {
        return {
            ud: this.ud.bind(this)
        }
    }

    ud(channel:string, sender:string, message:string, norbert:Norbert) {
        urban(message).first(res => {
            let word = res.word;
            let definition = res.definition;

            norbert.client.say(channel, template('UrbanDictionary.definition', {word, definition}))
        })
    }
}