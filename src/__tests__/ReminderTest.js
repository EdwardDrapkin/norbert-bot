import Reminder from '../lib/Reminder';
import expect from 'expect.js';

let r = new Reminder();

describe("Reminder.js", () => {
    describe("Wit.AI integration", () => {
        it("Test basic phrases", (done) => {
            let phrases = {
                "Remind me tomorrow that I need something": {
                    who: 'me',
                    what: 'I need something'
                },
                "Tell kkit http://google.com/ is a cool website" : {
                    who: 'kkit',
                    what: "http://google.com/ is a cool website"
                }
            };

            let pending = Object.keys(phrases).length;

            for(let phrase in phrases) {
                r.sendMessage(phrase, (data) => {
                    expect(data.parsed.who).to.eql(phrases[phrase].who);
                    expect(data.parsed.what).to.eql(phrases[phrase].what);

                    if(--pending == 0) {
                        done();
                    }
                });
            }
        });
    });
});

function compareTwoDates(a, b) {
    return (a-b)/1000 < 1;
}

function secondsFromNow(seconds) {
    return Date.now() + seconds;
}

function minutesFromNow(minutes) {
    return secondsFromNow(minutes * 60);
}

function hoursFromNow(hours) {
    return minutesFromNow(hours * 60);
}

function daysFromNow(days) {
    return hoursFromNow(days * 24);
}