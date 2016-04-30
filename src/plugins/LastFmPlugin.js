// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import LFM from 'lastfmapi';

export default class LastFmPlugin extends SimpleChanMsgPlugin {
    lfm:LFM;

    constructor(apiKey, secret) {
        super();
        this.lfm = new LFM({api_key: apiKey, secret: secret});
    }

    getTrigger() {
        return "!";
    }

    getChannels() {
        return [];
    }

    getCommands() {
        return {
            'np': ::this.nowPlaying
        }
    }

    nowPlaying(channel, sender, message, client) {
        let user = sender;

        if(message.trim() != "") {
            user = message.split(/\s+/)[0];
        }

        this.lfm['user'].getRecentTracks({limit: 1, user: user}, ((err, recent) => {
            if(recent.hasOwnProperty('track') &&
                recent.track.length > 0 &&
                recent.track[0].hasOwnProperty('@attr') &&
                recent.track[0]['@attr'].hasOwnProperty('nowplaying') &&
                recent.track[0]['@attr']['nowplaying'] == 'true'
            ) {
                let info = `${user} is currently playing ${recent.track[0].artist['#text']} - ${recent.track[0].name}`;
                client.say(channel, info);
            }
        }).bind(this));

    }
}