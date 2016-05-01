// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import LFM from 'lastfmapi';
import Norbert from 'lib/Norbert';

export default class LastFmPlugin extends SimpleChanMsgPlugin {
    init(norbert:Norbert) {
        super.init(norbert);
        norbert.db.run("CREATE TABLE IF NOT EXISTS karma (name TEXT PRIMARY KEY, channel TEXT, score INTEGER)");
    }

    getName() {
        return "Karma";
    }

    getCommands() {
        return {
            karma : this.checkKarma.bind(this),
        }
    }

    getHelp() {
        return {
            overview: "Ask the Buddha for where your soul stands on the karmic balance.",
            commands: {
                karma: "(soul?) - show a soul's karma.",
            }
        }
    }

    checkKarma(channel:string, sender:string, message:string, norbert:Norbert) {
        let stmt = norbert.db.prepare("SELECT score FROM karma WHERE name=? AND channel=?");
        stmt.all([message, channel], (err, rows) => {
            if(rows.length > 0) {
                let score = rows[0].score;

                if(score == 0) {
                    norbert.client.say(channel, `What kind of weirdo is ${message} with perfectly neutral karma?`);
                } else if (score > 0) {
                    norbert.client.say(channel, `${message} brings positive balance to the world with a karma of ${score}`);
                } else {
                    norbert.client.say(channel,
                        `${message} is a harbinger of entropy with a karma of ${score}`);
                }

            } else {
                norbert.client.say(channel, `${message} has no soul!`);
            }
        });
    }

}