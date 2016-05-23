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

    init(norbert:Norbert) {
        super.init(norbert);
        norbert.db.run("" +
            "CREATE TABLE IF NOT EXISTS quotes (" +
            "ID INTEGER PRIMARY KEY," +
            "added_by TEXT, " +
            "channel TEXT, " +
            "quote TEXT, " +
            "created INTEGER," +
            ")");
    }

    reset(norbert:Norbert) {
        norbert.db.run("TRUNCATE TABLE quotes");
    }
}