import Reminder from '../lib/Reminder';
import expect from 'expect.js';

const r = new Reminder('DSK325PVHGMLJSCW2IK5DNZ4LSNFWG5H');

describe("Reminder.js", () => {
    describe("Wit.AI integration", () => {
        it("Test basic phrases", (done) => {
            const phrases = {
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

            for(const phrase in phrases) {
                r.sendMessage(phrase, (e, data) => {
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