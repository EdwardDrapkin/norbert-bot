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
                roll: "[sides] - number of sides to roll"
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
        let dice = 1;

        message = message.trim();

        if(message != "") {
            let num = message.split(/\s+/)[0];
            if(num.match(/d/)) {
                let nums = num.split('d');
                dice = Number.parseInt(nums[0]);
                sides = Number.parseInt(nums[1]);

                let results = [];
                for(let i = 0; i < dice; i++) {
                    results.push(Math.floor(Math.random() * (sides - 1)) + 1);
                }

                norbert.client.say(channel, `${sender}, I rolled you ${dice} d${sides}s: [${results.join(', ')}]`);
            } else {
                sides = Number.parseInt(num);

                let result = Math.floor(Math.random() * (sides - 1)) + 1;
                norbert.client.say(channel, `${sender}, I rolled you a d${sides}: ${result}`);
            }
        }




    }
}