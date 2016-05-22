// @flow
import {Wit} from 'node-wit';

type dataT ={
    input:string,
    parsed?:{
        who:string,
        what:string,
        when:Date
    }
};

export default class Reminder {
    client:Wit;

    constructor(token:string) {
        this.client = new Wit(token, this);
    }

    say(sessionId:string, context:Object, message:string, cb:Function) {
        cb();
    }

    merge(sessionId:string, context:Object, message:string, cb:Function) {
        cb(context);
    }

    error(sessionId:string, context:Object, error:Error) {
        console.log(error.message);
    }

    sendMessage(message:string, callback: (error:Object, data:dataT)=>void) {
        this.client.message(message, {}, (e, data) => {
            const output:dataT = {
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