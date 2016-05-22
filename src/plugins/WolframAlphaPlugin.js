// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';
import WolframAlpha from 'wolfram-alpha';

export default class WolframAlphaPlugin extends SimpleChanMsgPlugin {
    client:WolframAlpha;

    constructor(apiKey:string) {
        super();
        this.client = WolframAlpha.createClient(apiKey);
    }

    getName() {
        return "WolframAlpha";
    }

    getHelp() {
        return {
            overview: "Query Wolfram|Alpha",
            commands: {
                wa: "query - do a search.",
            }
        }
    }

    getCommands() {
        return {
            wa: this.alpha.bind(this)
        }
    }

    alpha(channel:string, sender:string, message:string, norbert:Norbert) {
        this.client.query(message, function(err, results) {
            if(err != null) {
                norbert.client.say(channel, "error");
                console.log(err)
            }

            for(const result of results) {
                if(result.hasOwnProperty('title') && result.title == 'Result'
                    && result.hasOwnProperty('subpods') &&
                        result.subpods.length > 0
                ) {
                    norbert.client.say(channel, `<Wolfram|Alpha> ${result.subpods[0].text}`);
                }
            }
        });
    }
}