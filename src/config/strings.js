export default {
    error: "There has been an unexpected error",

    Spotify: {
        help: {
            overview: "Spotify Plugin",
            commands: {
                spotArtist: "(artist) - search for an artist on Spotify.",
                spotTrack: "(track) - search for a track on Spotify.",
                playlist: "Show the channel playlist.",
                renamePlaylist: "Rename the channel playlist, if you're so naughty.",
                listTrack: "(track [spotify:track:XXX]) - add a track to the channel playlist.",
                startSpotifyAuth: "[BOT OWNER] - login with OAuth to Spotify.  This gives me access to your spotify account, click at your own risk.",
                expireSpotifyAuth: "Stop auto-renewing auth tokens"
            }
        },
        song: "{sender}, here's your song! {uri} - {artist} / {album} - {name}",
        authStart: "{sender} has authenticated the bot with Spotify!",
        playlist: "Channel playlist [{playlist}]: {uri}",
        playlistUpdated: "Channel playlist is now named {name}!",
        playlistTrackAdded: "{sender} added songs to the channel playlist! Songs added: {songs}",
        artist: "[{name} ({popularity}) {uri}]",
        track: "[{artist} / {album} - {title} ({uri})]",
    },

    LastFm: {
        help: {
            overview: "Last.FM API Plugin",
            commands: {
                np: "(user?) - show your now playing track, or another user's.",
                setLastFm: "(user) - save your last.fm username instead of defaulting to your IRC handle.",
                myLastFm: "retrieve your saved last.fm username, if any."
            }
        },

        whoami: "{user} I know you as {lastFm}.",
        unknownUser: "{user} I don't have a last.fm nick stored for you.",
        userSaved: "{user}, I will now remember you as {lastFm}",
        np: "{user} is currently listening to {title} by {artist}.",
        notP: "{user} is not currently listening to anything."
    },

    Quote: {
        help: {
            overview: "Just a quote plugin, y'all!",
            commands: {
                quote: "fetch a quote",
                addQuote: "[quote] - add a quote"
            }
        },
        inserted: "Okay {sender}, I have inserted the quote!",
        fetched: "[{ID} - {addedBy}] {quote}"
    },

    Sed: {
        help: {
            overview: "Watches for s/search/replace/flags style statements."
        },

        replaced: "{sender} suggests: <{from}> {replaced}"
    },

    TableFlip: {
        help: {
            overview: "FLIP. TABLES.",
            commands: {
                flip: "FLIP THAT TABLE"
            }
        },

        flipper: "(╯°□°）╯︵ {message}"
    },

    UrbanDictionary: {
        help: {
            overview: "Because nerds don't know the streets.",
            commands: {
                ud: "[word] - lookup a word."
            }
        },

        definition: "[{word}] - {definition}"
    },

    UrlTitle: {
        help: {
            overview: "Gets titles from URLs."
        },

        title: "{msg}",
        image: "{height}x{width} {type} {humanSize}",
        mp4: "video/mp4: {duration}, {dimensions}, {fileSize}"
    },

    WeatherUnderground: {
        userSaved: "{sender}, I will now remember your location as {weather}",
        unknownUser: "{sender}, I don't have any weather location saved for you.",
        noConditions: "No weather found for {message}",
        currentConditions: "Current conditions: {weather} / {temp} [feels like {feelsLike}] "
                + " / {humidity} humidity / Wind {wind} / {observation} at {location}"
                + " / More at {url}",

        help: {
            overview: "Weather Underground Plugin",
            commands: {
                weather: "Gets the weather, shocking!",
                w: "Gets the weather with less keystrokes",
                setWeather: "Sets your weather location"
            }
        }
    },

    WolframAlpha: {
        fetched:  "<Wolfram|Alpha> {text}",
        help: {
            overview: "Query Wolfram|Alpha",
            commands: {
                wa: "query - do a search."
            }
        }
    },

    YouTube: {
        help: {
            overview: "Advanced YouTube support"
        },

        video: "You[Tube]: {title} ({duration}) / [Views: {views} / Likes: {likes}"
    }
}
