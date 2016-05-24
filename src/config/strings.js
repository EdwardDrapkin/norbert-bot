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