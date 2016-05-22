export default class QuotePlugin {
    static stripTimestamps(input) {
        return input
            .replace(/(\d{2}:?)\d{2}/, '')
            .replace(/\W+(\W\w)/, '$1')
            .trim();
    }

}