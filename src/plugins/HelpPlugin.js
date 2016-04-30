// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';

export default class HelpPlugin extends SimpleChanMsgPlugin {
    meta:{
        prefix: string,
        version: string,
        name: string
    };
    helpData:{
        __commands: {
            [K:string]: string
        },
        [plugin:string] : {
            overview: string,
            commands: {
                [K:string]: string
            }
        }
    };

    init(norbert:Norbert) {
        super.init(norbert);
        this.helpData = norbert.helpData;
        this.meta = norbert.meta;
    }

    getName() {
        return "Help";
    }

    getHelp() {
        return {
            overview: "Help and Hello Plugin",
            commands: {
                commands: "show a list of available commands.",
                hello: "say hello to the world.",
                help: "tell you everything I know about a specific command."
            }
        }
    }

    specificCommandHelp(channel:string, sender:string, message:string, norbert:Norbert) {
        let command = message.trim();

        if(!this.helpData['__commands'].hasOwnProperty(command)) {
            norbert.client.say(channel, `I don't know anything about ${message}`);
        }

        let msg = `${this.meta.prefix}${command}: ${this.helpData['__commands'][command]}`;
        norbert.client.say(channel, msg);
    }

    getCommands() {
        return {
            'commands': this.commands,
            'hello': this.help,
            'help': this.specificCommandHelp,
            'plugin': this.plugin,
            'plugins': this.plugins
        }
    }


    plugins(channel:string, sender:string, message:string, norbert:Norbert) {
        let _plugins = this.helpData;
        delete _plugins['__commands'];

        let pluginsN = Object.keys(_plugins).length;
        let pluginsS = Object.keys(_plugins).join(', ');

        let msg = `${pluginsN} available: (${pluginsS}). For more information use ${this.meta.prefix}plugin command.`
        norbert.client.say(channel, msg);

    }

    plugin(channel:string, sender:string, message:string, norbert:Norbert) {
        let _plugins = this.helpData;
        delete _plugins['__commands'];

        if(!_plugins.hasOwnProperty(message.trim())) {
            norbert.client.say(channel, `I don't know anything about ${message}`);
            return;
        }

        let pluginsN = Object.keys(_plugins).length;
        let plugin = _plugins[message.trim()].overview;

        let msg = `${message.trim()} - ${plugin}`;
        norbert.client.say(channel, msg);

    }

    commands(channel:string, sender:string, message:string, norbert:Norbert) {
        let commandsN = Object.keys(this.helpData['__commands']).length;
        let commandsS = Object.keys(this.helpData['__commands']).join(', ');

        let msg = `${commandsN} available: (${commandsS}). For more information use ${this.meta.prefix}help command.`
        norbert.client.say(channel, msg);
    }

    help(channel:string, sender:string, message:string, norbert:Norbert) {
        let pluginN = Object.keys(this.helpData).length - 1;
        let commandsN = Object.keys(this.helpData['__commands']).length;

        let msg = `Hello! Currently running version ${this.meta.version} of ${this.meta.name} with ${pluginN} plugins loaded for a total`
            + ` of ${commandsN} commands.  Please ${this.meta.prefix}plugins or ${this.meta.prefix}commands for more information.`;

        norbert.client.say(channel, msg);
    }

}