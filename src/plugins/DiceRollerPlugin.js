// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';

export default class DiceRollerPlugin extends SimpleChanMsgPlugin {
    constructor() {
        super();
    }

    getName() {
        return "DiceRoller";
    }

    getHelp() {
        return {
            overview: "Roll a dice.",
            commands: {
                wa: "[sides] - number of sides to roll"
            }
        }
    }

    getCommands() {
        return {
            roll: this.roll.bind(this)
        }
    }

    roll(channel:string, sender:string, message:string, norbert:Norbert) {
        let sides = 20;

        message = message.trim();

        if(message != "") {
            let num = message.split(/\s+/)[0];
            sides = Number.parseInt(num);
        }

        let result = Math.floor(Math.random() * (sides - 1)) + 1;

        norbert.client.say(channel, `${sender}, I rolled you a d${sides}: ${result}`);
    }
}