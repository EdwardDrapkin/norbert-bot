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
            commands?: {
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
                commands: "show a list of available _commands.",
                hello: "say hello to the world.",
                help: "tell you everything I know about a specific command."
            }
        }
    }

    specificCommandHelp(channel:string, sender:string, message:string, norbert:Norbert) {
        const command = message.trim();

        if(!command) {
            return this.help(channel,sender,message,norbert);
        }

        if(!this.helpData['__commands'].hasOwnProperty(command)) {
            norbert.client.say(channel, `I don't know anything about a command named ${message}.`);
            return;
        }

        const msg = `${this.meta.prefix}${command}: ${this.helpData['__commands'][command]}`;
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
        const _plugins = {};
        Object.assign(_plugins, this.helpData);
        delete _plugins['__commands'];

        const pluginsN = Object.keys(_plugins).length;
        const pluginsS = Object.keys(_plugins).join(', ');

        const msg = `${pluginsN} available: (${pluginsS}). For more information use the ${this.meta.prefix}plugin command.`
        norbert.client.say(channel, msg);

    }

    plugin(channel:string, sender:string, message:string, norbert:Norbert) {
        const _plugins = {};
        Object.assign(_plugins, this.helpData);
        delete _plugins['__commands'];

        if(!_plugins.hasOwnProperty(message.trim())) {
            norbert.client.say(channel, `I don't know anything about ${message}`);
            return;
        }

        const pluginsN = Object.keys(_plugins).length;
        const plugin = _plugins[message.trim()].overview;

        const msg = `${message.trim()} - ${plugin}`;
        norbert.client.say(channel, msg);

    }

    commands(channel:string, sender:string, message:string, norbert:Norbert) {

        const commandsN = Object.keys(this.helpData['__commands']).length;
        const commandsS = Object.keys(this.helpData['__commands']).join(', ');

        const msg = `${commandsN} available: (${commandsS}). For more information use ${this.meta.prefix}help command.`
        norbert.client.say(channel, msg);
    }

    help(channel:string, sender:string, message:string, norbert:Norbert) {
        const pluginN = Object.keys(this.helpData).length - 1;
        const commandsN = Object.keys(this.helpData['__commands']).length;

        const msg = `Hello! Currently running version ${this.meta.version} of ${this.meta.name} with ${pluginN} plugins loaded for a total`
            + ` of ${commandsN} commands.  Please ${this.meta.prefix}plugins or ${this.meta.prefix}commands for more information.`;

        norbert.client.say(channel, msg);
    }

}