// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';

export default class KarmaPlugin extends SimpleChanMsgPlugin {
    init(norbert:Norbert) {
        super.init(norbert);
        this.requirePlugin('KarmaPolice');
    }

    getName() {
        return "Karma";
    }

    getCommands() {
        return {
            karma : this.checkKarma.bind(this)
        }
    }

    getHelp() {
        return {
            overview: "Ask the Buddha for where your soul stands on the karmic balance.",
            commands: {
                karma: "(soul?) - show a soul's karma."
            }
        }
    }

    checkKarma(channel:string, sender:string, message:string, norbert:Norbert) {
        const stmt = norbert.db.prepare("SELECT score FROM karma WHERE name=? AND channel=?");

        this.log.trace({
            checkKarma: {
                channel: channel,
                "requested by": sender,
                user: message
            }
        });

        stmt.all([message, channel], (err, rows) => {
            if(rows.length > 0) {
                const score = rows[0].score;

                if(score == 0) {
                    norbert.client.say(channel, `What kind of weirdo is ${message} with perfectly neutral karma?`);
                } else if (score > 0) {
                    norbert.client.say(channel, `${message} brings positive balance to the world with a karma of ${score}`);
                } else {
                    norbert.client.say(channel,
                        `${message} is a harbinger of entropy with a karma of ${score}`);
                }

            } else {
                norbert.client.say(channel, `${message} has no soul! Perhaps you can tell me something ${sender}?`);
            }
        });
    }

}