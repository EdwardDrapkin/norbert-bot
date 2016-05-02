// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';
import chrono from 'chrono-node';

export default class ReminderPlugin extends SimpleChanMsgPlugin {
    getHelp() {
        return {
            overview: "the best reminder plugin you will find anywhere on IRC.",
            commands: {
                remind: "[person] [text] - create a reminder for person, natural language text!"
            }
        };
    }

    getName() {
        return "Reminder";
    }

    init(norbert:Norbert) {
        super.init(norbert);
        norbert.db.run("CREATE TABLE IF NOT EXISTS reminders (" +
            "ID INTEGER PRIMARY KEY," +
            "from_who TEXT, " +
            "channel TEXT, " +
            "to_who TEXT, " +
            "remind_after INTEGER," +
            "reminder TEXT," +
            "created INTEGER)");
    }

    subscribe(norbert:Norbert) {
        super.subscribe(norbert);

        norbert.client.on('CHANMSG', (data) => {
            if(data.receiver.match(this.receiverMatches)) {
                this.detectReminders(data.receiver, data.sender, data.message, norbert);
            }
        })
    }

    reset(norbert:Norbert) {
        norbert.db.run("TRUNCATE TABLE reminders");
    }

    getCommands() {
        return {
            remind: this.createReminder.bind(this)
        }
    }

    detectReminders(channel:string, sender:string, message:string, norbert:Norbert) {
        let stmt = norbert.db.prepare("SELECT ID, from_who, to_who, reminder, created FROM reminders " +
            "WHERE to_who=? AND channel=? AND remind_after < ?");

        let deleteStmt = norbert.db.prepare("DELETE FROM reminders WHERE ID=?");

        stmt.all([sender.toLowerCase(), channel, new Date().getTime()], (err, rows) => {
            for(let row of rows) {
                let who = row.from_who;
                let reminder = row.reminder;
                let created = new Date(row.created).toLocaleDateString('en-US',
                    {hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short'});

                let msg = `${sender}, you have a message! [${created}] <${who}> ${reminder}`;

                norbert.client.say(channel, msg);

                deleteStmt.run([row.ID]);
            }
        });
    }


    createReminder(channel:string, sender:string, message:string, norbert:Norbert) {
        let stmt = norbert.db.prepare("INSERT INTO reminders (from_who, channel, to_who, remind_after, reminder, created) " +
            "VALUES (?, ?, ?, ?, ?, ?)");

        let parsed = this.parseReminderString(message);
        let fromWho = sender.toLowerCase();
        let toWho = parsed.who.toLowerCase() == 'me' ? sender : parsed.who.toLowerCase();
        let remindAfter = parsed.remindAfter;
        let reminder = parsed.reminder;
        let created = new Date().getTime();

        stmt.run([fromWho, channel, toWho, remindAfter, reminder, created], err => {
            if(err) {
                norbert.client.say(channel, "error oh noes");
            }
        });
    }

    parseReminderString(input:string) {
        let cruft = {
            that: 1,
            to: 1
        };

        let chronoParsed = chrono.parse(input);
        let period = -1;

        let split = input.split(/\s+/);
        let who = split.shift();

        input = split.map(e => e.trim()).join(' ').replace(/\s+/, ' ');

        if(chronoParsed && chronoParsed[0] && chronoParsed[0].hasOwnProperty('text')) {
            period = chronoParsed[0].start.date().getTime();
            input = input.replace(chronoParsed[0].text, '').trim();
        }

        split = input.split(/\s+/);

        let next = split[0];

        while(cruft.hasOwnProperty(next)) {
            next = split.shift();
        }

        input = split.map(e => e.trim()).join(' ').replace(/\s+/, ' ');

        return {
            reminder: input.trim(),
            remindAfter: period,
            remindAfterDate: new Date(period),
            who: who.trim()
        };
    }
}