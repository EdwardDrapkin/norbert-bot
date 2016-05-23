// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';

export default class QuotePlugin extends SimpleChanMsgPlugin {
    static stripTimestamps(input) {
        return input.replace(/^(?:\W*\d*?\W*)*(\W\w)/, '$1').trim();
    }

    getName() {
        return "Quote";
    }

    getHelp() {
        return {
            overview: "just a quote plugin, y'all.",
            commands: {
                quote: "fetch a quote",
                addQuote: "[quote] - add a quote"
            }
        }
    }

    getCommands() {
        return {
            addQuote: this.addQuote.bind(this),
            quote: this.quote.bind(this)
        };
    }

    init(norbert:Norbert) {
        super.init(norbert);
        norbert.db.run("" +
            "CREATE TABLE IF NOT EXISTS quotes (" +
            "ID INTEGER PRIMARY KEY," +
            "added_by TEXT, " +
            "channel TEXT, " +
            "quote TEXT, " +
            "created INTEGER" +
            ")");
    }

    reset(norbert:Norbert) {
        norbert.db.run("TRUNCATE TABLE quotes");
    }

    quote(channel:string, sender:string, message:string, norbert:Norbert) {
        const stmt = norbert.db.prepare('SELECT ID, added_by, quote FROM quotes WHERE channel=? LIMIT 1');

        stmt.all([channel.toLowerCase()], (err, rows) => {
            for(const row of rows) {
                let msg = `[${row.ID} - ${row.added_by}] ${row.quote}`;
                norbert.client.say(channel, msg);
            }
        });
    }

    addQuote(channel:string, sender:string, message:string, norbert:Norbert) {
        const stmt = norbert.db.prepare('INSERT INTO quotes (added_by, channel, quote, created) ' +
            'VALUES (?, ?, ?, ?)');

        stmt.run([sender, channel.toLowerCase(), QuotePlugin.stripTimestamps(message), new Date().getTime()], err => {
            if(err) {
                norbert.client.say(channel, "error oh noes");
            } else {
                norbert.client.say(channel, `Okay ${sender}, I have stored the quote.`);
            }
        });
    }
}