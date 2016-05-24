export default {
    error: "There has been an unexpected error",

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

    UrlTitle: {
        help: {
            overview: "Gets titles from URLs."
        },

        title: "<{sender}> {msg}",
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
    }
}