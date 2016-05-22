import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';

export default class QuotePlugin {
    static stripTimestamps(input) {
        return input.replace(/^(?:\W*\d*?\W*)*(\W\w)/, '$1').trim();
    }

    getName() {
        return "Quote";
    }

    getHelp() {
        return {
            overview: "just a quote plugin, y'all.",
            commands: {
                quote: "fetch a quote",
                addquote: "[quote] - add a quote"
            }
        }
    }
}