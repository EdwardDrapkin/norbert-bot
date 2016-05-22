import chrono from 'chrono-node';

const CHRONO_REPLACEMENTS = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10
};

const CHRONO_TRASH = {
    to: true,
    that: true
};

const STATE = {
    WHO: 1,
    CLEAN_UP_FOR_CHRONO: 2,
    DO_PARSE: 3,
    DONE_PARSING: 4,
    RETURNING: 5
};

export default class Reminder {
    raw = '';
    tokens = [];
    state = 0;
    result = {};
    reminderTokens = [];
    dateTokens = [];
    chronoStart = -1;
    chronoLength = -1;


    constructor(input) {
        this.raw = input;
        this.tokens = input.split(/\s+/);
        this.state = STATE.WHO;
        this.result = {};
    }

    get current() {
        let val,current ='';

        let stream = this.streamTokens();

        while(val = stream.next().value) {
            console.log(val);
            current += `${val}`;
        }

        return {
            current: current,
            dateTokens: this.dateTokens,
            reminderTokens: this.reminderTokens
        };
    }

    *streamTokens() {
        this.result = {};

        let i = 0;

        let tokens = this.tokens;
        let length = tokens.length;
        this.tokens = [];

        for(i; i < length;) {
            let word = tokens[i];
            switch(this.state) {
                case(STATE.WHO):
                    this.result.who = word;
                    this.state++;
                    i++;
                    break;
                case(STATE.CLEAN_UP_FOR_CHRONO):
                    if(CHRONO_REPLACEMENTS.hasOwnProperty(word)) {
                        this.tokens.push(CHRONO_REPLACEMENTS[word]);
                    } else if(!CHRONO_TRASH.hasOwnProperty(word)) {
                        this.tokens.push(word);
                    }

                    if(i+1 == tokens.length) {
                        i = 0;
                        tokens = this.tokens;
                        length = tokens.length;
                        this.state++;
                    } else {
                        i++;
                    }
                    break;
                case(STATE.DO_PARSE):
                    let phrase = this.tokens.join(' ');
                    let parsed = chrono.parse(phrase);
                    if(!parsed[0]) {
                        this.state++;
                        tokens = this.tokens;
                        length = tokens.length;
                        i = 0;
                    } else {
                        this.chronoStart = parsed[0].index;
                        this.chronoLength = parsed[0].text.split(/\s+/).length;
                        this.state++;
                    }

                    break;
                case STATE.DONE_PARSING:
                    if(this.chronoStart == 0 && this.chronoLength > 0) {
                        this.dateTokens.push(word);
                        this.chronoLength--;
                    } else {
                        this.chronoStart -= word.length + 1;
                        this.reminderTokens.push(word);
                    }

                    if(i + 1 == tokens.length) {
                        i = 0;
                        tokens = this.tokens;
                        length = tokens.length;
                        this.state++
                    }

                    i++;
                    break;
                case STATE.RETURNING:
                    i++;
                    yield word;
            }
        }

    }

    static parseReminderString(input:string) {
        return new Reminder(input).current;
        /*let cruft = {
            that: 1,
            to: 1
        };

        let chronoParsed = chrono.parse(input);
        let period = -1;

        let split = input.split(/\s+/);
        let who = split.shift();

        input = split.map(e => e.trim()).join(' ').replace(/\s+/, ' ');

        if(chronoParsed && chronoParsed[0] && chronoParsed[0].hasOwnProperty('text')) {
            period = chronoParsed[0].start.date().getTime();
            input = input.replace(chronoParsed[0].text, '').trim();
        }

        split = input.split(/\s+/);

        let next = split[0];

        while(cruft.hasOwnProperty(next)) {
            next = split.shift();
        }

        input = split.map(e => e.trim()).join(' ').replace(/\s+/, ' ');

        return {
            reminder: input.trim(),
            remindAfter: period,
            remindAfterDate: new Date(period),
            who: who.trim()
        };*/
    }
}