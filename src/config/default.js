import LastFmPlugin from 'plugins/LastFmPlugin.js';

let lastFmOpts = {
    'api_key': '467b4068bb8b4774f972e95e8bd2d81f',
    'secret': 'a62a330dc620c528440cf9e4c6a30261'
};

let plugins = [new LastFmPlugin(lastFmOpts.api_key, lastFmOpts.secret)];

export default {
    "server": {
        "hostname": "irc.p2p-network.net",
        "port": "6667",
        "SSL": false,
        "nick": "norbert-beta",
        "fullname": "Norbert.The.Bot",
        "channels": [
            "#420"
        ]
    },

    plugins: plugins

};