// @flow
import {Wit} from 'node-wit';

export default class Reminder {
    client:Wit;

    constructor(token:string) {
        this.client = new Wit(token, this);
    }

    say(sessionId, context, message, cb) {
        cb();
    }

    merge(sessionId, context, entities, message, cb) {
        cb(context);
    }

    error(sessionId, context, error) {
        console.log(error.message);
    }

    sendMessage(message, callback) {
        this.client.message(message, {}, (e, data) => {
            let output = {
                input: data._text
            };

            if(!e) {
                output.parsed = {
                    who: data.entities.name ? data.entities.name[0].value : 'me',
                    what: data.entities.message ? data.entities.message[0].value : '',
                    when: data.entities.datetime ? new Date(data.entities.datetime[0].value) : new Date(0)
                };
            }

            callback(e, output);
        })
    }
}