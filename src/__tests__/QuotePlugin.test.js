import {stripTimestamps} from '../plugins/QuotePlugin';
import expect from 'expect.js';

describe("Quote plugin", () => {
    it("Tests removal of various timestamp patterns", () => {
        let messages = [
            "<foo> is a bar",
            "<@foo> is a bar",
            "foo> is a bar",
            "foo is a bar",
            "@foo is a bar",
            "foo: is a bar",
            "[foo] is a bar",
            "    foo is a bar",
            "    foo is a <00:00> bar",
        ];
        let inputs = [
            "<00:00>",
            "00:00",
            "00:00:00",
            "20160522 01:46:32",
            "0522@01:46",
            "00:00 -",
            "[[00:00]]"
        ];

        for(let message of messages) {
            for(let input of inputs) {
                const test = `${input} ${message}`;
                expect(stripTimestamps(test)).to.eql(message.trim());
            }
        }

    });
});