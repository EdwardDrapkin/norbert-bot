import LastFmPlugin from 'plugins/LastFmPlugin.js';

let lastFmOpts = {
    api_key: '467b4068bb8b4774f972e95e8bd2d81f',
    secret: 'a62a330dc620c528440cf9e4c6a30261',
    templates: {
        'np': "%user% is currently listening to %title% by %artist%.",
        'not_np': '%user% is currently not listening to anything.'
    }
};

let plugins = [
    new LastFmPlugin(lastFmOpts.api_key, lastFmOpts.secret, lastFmOpts.templates)
];

export default {
    "server": {
        "hostname": "irc.freenode.net",
        "port": "6667",
        "SSL": false,
        "nick": "norbert-beta",
        "fullname": "Norbert.The.Bot",
        "channels": [
            "##phpbottalk"
        ]
    },

    database: {
        location: "Norbert.sqlite"
    },

    plugins: plugins

};