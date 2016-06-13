// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import LFM from 'lastfmapi';
import Norbert from 'lib/Norbert';
import template from 'lib/template';

export default class LastFmPlugin extends SimpleChanMsgPlugin {
    lfm:LFM;

    constructor(apiKey:string, secret:string) {
        super();
        this.lfm = new LFM({api_key: apiKey, secret: secret});
    }

    init(norbert:Norbert) {
        super.init(norbert);

        this.log.trace({
            tableInit: {
                table: 'lastfm'
            }
        });

        norbert.db.run("CREATE TABLE IF NOT EXISTS lastfm (name TEXT PRIMARY KEY, lastfm TEXT)");
    }

    reset(norbert:Norbert) {
        norbert.db.run("TRUNCATE TABLE lastfm");
    }

    getName() {
        return "Last.FM";
    }

    getCommands() {
        return {
            'np': this.nowPlaying.bind(this),
            'setLastFm': this.saveUser.bind(this),
            'myLastFm': this.lookupUser.bind(this)
        }
    }

    getHelp() {
        return template.getObject('LastFm.help');
    }

    lookupUser(channel:string, sender:string, message:string, norbert:Norbert) {
        const stmt = norbert.db.prepare("SELECT * FROM lastfm WHERE name=(?)");
        this.log.trace({
            lookupUser: {
                sender: sender
            }
        });

        stmt.all([sender], (err, rows) => {
            if(rows.length > 0) {
                const attrs = {
                    user: sender,
                    lastFm: rows[0].lastfm
                };
                norbert.client.say(channel, template('LastFm.whoami', attrs));
            } else {
                norbert.client.say(channel, template('LastFm.unknownUser', {user:sender}));
            }
        });
    }

    saveUser(channel:string, sender:string, message:string, norbert:Norbert) {
        const user = sender;
        const lastFm = message;

        const stmt = norbert.db.prepare("INSERT OR REPLACE INTO lastfm (name, lastfm) VALUES (?, ?)");
        this.log.trace({
            saveUser: {
                sender: sender,
                lastFm: lastFm
            }
        });

        stmt.run([user, lastFm], (err) => {
            if(err) {
                norbert.client.say(channel, template('error'));
                this.log.error({err});
            } else {
                norbert.client.say(channel, template('LastFm.unknownUser', {user:sender, lastFm:lastFm}));
            }
        });
    }

    nowPlaying(channel:string, sender:string, message:string, norbert:Norbert) {
        let user;
        const client = norbert.client;

        if(message.trim() != "") {
            user = message.split(/\s+/)[0];
        } else {
            user = sender;
        }

        const stmt = norbert.db.prepare("SELECT * FROM lastfm WHERE name=(?)");
        this.log.trace({
            nowPlaying: {
                lastFm: user
            }
        });

        stmt.all([user], (err, rows) => {

            let lastFmName = "";

            if(rows.length > 0) {
                lastFmName = rows[0].lastfm;
            } else {
                lastFmName = user;
            }

            this.lfm['user'].getRecentTracks({limit: 1, user: lastFmName}, (err, recent) => {
                let info;

                if(recent &&
                    recent.hasOwnProperty('track') &&
                    recent.track.length > 0 &&
                    recent.track[0].hasOwnProperty('@attr') &&
                    recent.track[0]['@attr'].hasOwnProperty('nowplaying') &&
                    recent.track[0]['@attr']['nowplaying'] == 'true'
                ) {
                    const meta = this.gatherMetaData(recent.track[0]);
                    meta.user = lastFmName;
                    info = template('LastFm.nP', {meta});
                } else {
                    info = template('LastFm.notP', {user});
                }

                client.say(channel, info);
            });
        });
    }

    gatherMetaData(track:Object) : {[K:string]:string} {
        const artist = track.hasOwnProperty('artist') &&
            track['artist'].hasOwnProperty('#text') ?
            track['artist']['#text'] : '';
        const title = track.hasOwnProperty('name') ? track['name'] : '';
        const album = track.hasOwnProperty('album') &&
            track['album'].hasOwnProperty('#text') ?
            track['album']['#text'] : '';
        const date = track.hasOwnProperty('date') &&
            track['date'].hasOwnProperty('#uts') ?
            (new Date(track['date']['uts'] * 1000)).toDateString() : '';

        return {artist, title, album, date};
    }
}