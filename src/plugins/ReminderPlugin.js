// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';
import Reminder from 'lib/Reminder';

export default class ReminderPlugin extends SimpleChanMsgPlugin {
    reminder:Reminder;

    constructor(token:string) {
        super();
        this.reminder = new Reminder(token);
    }

    getHelp() {
        return {
            overview: "the best reminder plugin you will find anywhere on IRC.",
            commands: {
                remind: "[person] [text] - create a reminder for person, natural language text!",
                tell: "same thing as remind, because some of you need synonyms.",
                myReminders: "ask for your pending sent reminders."
            }
        };
    }

    getName() {
        return "Reminder";
    }

    init(norbert:Norbert) {
        super.init(norbert);
        this.log.trace({
            tableInit: {
                table: 'reminders'
            }
        });
        norbert.db.run("" +
            "CREATE TABLE IF NOT EXISTS reminders (" +
            "ID INTEGER PRIMARY KEY," +
            "from_who TEXT, " +
            "channel TEXT, " +
            "to_who TEXT, " +
            "remind_after INTEGER," +
            "reminder TEXT," +
            "created INTEGER" +
            ")");
    }

    subscribe(norbert:Norbert) {
        super.subscribe(norbert);

        norbert.client.on('message', (from, to, message) => {
            if(to.match(this.receiverMatches)) {
                this.detectReminders(to, from, message, norbert);
            }
        })
    }

    reset(norbert:Norbert) {
        norbert.db.run("TRUNCATE TABLE reminders");
    }

    getCommands() {
        return {
            tell: this.createReminder.bind(this),
            remind: this.createReminder.bind(this),
            myReminders: this.whatAreMyReminders.bind(this)
        }
    }

    whatAreMyReminders(channel:string, sender:string, message:string, norbert:Norbert) {
        const stmt = norbert.db.prepare("SELECT  * FROM reminders WHERE from_who = ?");

        this.log.trace({
            whatAreMyReminders: {
                sender: sender,
                channel: channel
            }
        });

        stmt.all([sender], (err, rows) => {
            if(rows.length == 0) {
                norbert.client.say(channel, `${sender}, you have no pending sent messages.`);
            } else {
                norbert.client.say(channel,
                    `${sender}, you have ${rows.length} pending messages.  Sending your more intimate details in PM.`);
                for(let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    norbert.client.say(sender, `MESSAGE #${i+1} of ${rows.length}: to: ${row.to_who}, channel ${row.channel}, ` +
                        `will remind ${this._remindAfterString(row.remind_after)}`);
                    norbert.client.say(sender, `MESSAGE #${i+1} of ${rows.length}: ${row.reminder}`);
                }
            }
        })

    }

    detectReminders(channel:string, sender:string, message:string, norbert:Norbert) {
        const stmt = norbert.db.prepare("SELECT ID, from_who, to_who, reminder, created FROM reminders " +
            "WHERE to_who=? AND channel=? AND remind_after < ?");

        const deleteStmt = norbert.db.prepare("DELETE FROM reminders WHERE ID=?");

        this.log.trace({
            detectReminders: {
                sender: sender,
                channel: channel
            }
        });

        stmt.all([sender.toLowerCase(), channel, new Date().getTime()], (err, rows) => {
            for(const row of rows) {
                const who = row.from_who;
                const reminder = row.reminder;
                const created = new Date(row.created).toLocaleDateString('en-US',
                    {hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short'});

                const msg = `${sender}, you have a message! [${created}] <${who}> ${reminder}`;

                norbert.client.say(channel, msg);

                deleteStmt.run([row.ID]);
            }
        });
    }

    _remindAfterString(remindAfter:number) {
        return remindAfter > 0 ? `after ${new Date(remindAfter).toLocaleDateString('en-US',
            {hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short'})}` : "ASAP";
    }

    createReminder(channel:string, sender:string, message:string, norbert:Norbert) {
        const stmt = norbert.db.prepare(
            "INSERT INTO reminders (from_who, channel, to_who, remind_after, reminder, created) " +
            "VALUES (?, ?, ?, ?, ?, ?)");

        this.log.trace({
            createReminder: {
                sender: sender,
                channel: channel
            }
        });
        
        this.reminder.sendMessage(`remind ${message}`, (err, data) => {
            if(!err && data.parsed){
                const parsed = data.parsed;
                const fromWho = sender.toLowerCase();
                const toWho = parsed.who.toLowerCase() == 'me' ? sender : parsed.who.toLowerCase();
                const remindAfter = parsed.when;
                const reminder = parsed.what;
                const created = new Date().getTime();
                const human = this._remindAfterString(parsed.when);

                stmt.run([fromWho, channel, toWho, remindAfter, reminder, created], err => {
                    if(err) {
                        norbert.client.say(channel, "error oh noes");
                        this.log.error({
                            error: err
                        });
                    } else {
                        norbert.client.say(channel, `Okay, ${sender}, I will remind ${toWho} in ${channel} ${human}`);
                    }
                });
            }
        });
    }
}