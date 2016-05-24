// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';
import template from 'lib/template';

export function stripTimestamps(input:string) {
    return input.replace(/.*?([^\w\s]?[+%@&~]?[a-z])/i, '$1').trim();
}

export default class QuotePlugin extends SimpleChanMsgPlugin {

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

        this.log.trace({
            tableInit: {
                table: 'quotes'
            }
        });

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

        this.log.trace({
            quote: {
                channel: channel,
                "requested by": sender,
                message: message
            }
        });

        stmt.all([channel.toLowerCase()], (err, rows) => {
            for(const row of rows) {
                let msg = `[${row.ID} - ${row.added_by}] ${row.quote}`;
                this.log.trace("Fetched quote: " + msg);
                norbert.client.say(channel, msg);
            }
        });
    }

    addQuote(channel:string, sender:string, message:string, norbert:Norbert) {
        const stmt = norbert.db.prepare('INSERT INTO quotes (added_by, channel, quote, created) ' +
            'VALUES (?, ?, ?, ?)');

        channel = channel.toLowerCase();
        const stripped = stripTimestamps(message);
        const created = new Date().getTime();

        this.log.trace({
            addQuote: {
                sender: sender,
                channel: channel,
                created: created,
                message: stripped
            }
        }, "Preparing to insert quote");

        stmt.run([sender, channel, stripped, created], err => {
            if(err) {
                norbert.client.say(channel, template('error'));
                this.log.error(err, "Error inserting quote.");
            } else {
                norbert.client.say(channel, template('Quote.inserted', {sender}));
            }
        });
    }
}