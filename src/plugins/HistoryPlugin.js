// @flow

import Plugin from 'plugins/Plugin';
import Norbert from 'lib/Norbert';

export default class HistoryPlugin extends Plugin {
    stmt:Object;

    getName() {
        return "History";
    }

    getHelp() {
        return {
            overview: "History plugin, required for many other plugins."
        };
    }

    init(norbert:Norbert) {
        super.init(norbert);
        norbert.db.run("" +
            "CREATE TABLE IF NOT EXISTS history (" +
            "ID integer primary key, " +
            "channel TEXT, " +
            "sender TEXT, " +
            "message TEXT, " +
            "timestamp INTEGER" +
            ")");

        this.stmt = norbert.db.prepare("" +
            "INSERT INTO history " +
            "(channel, sender, message, timestamp) " +
            "VALUES (?, ?, ?, ?)");
    }

    subscribe(norbert:Norbert) {
        norbert.client.on('message', this.logMessage.bind(this, norbert));
    }

    reset(norbert:Norbert) {
        norbert.db.run("TRUNCATE TABLE history");
    }

    logMessage(norbert:Norbert, from:string, to:string, message:string) {
        let created = new Date().getTime();

        this.stmt.run([to, from, message, created], err => {
            if(err) {
                norbert.client.say(to, "error oh noes");
                console.error(err);
            }
        })
    }

    
}