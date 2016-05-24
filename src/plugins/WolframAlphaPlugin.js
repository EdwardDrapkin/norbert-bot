// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';
import WolframAlpha from 'wolfram-alpha';
import template from 'lib/template';

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
        return template.getObject('WolframAlpha.help');
    }

    getCommands() {
        return {
            wa: this.alpha.bind(this)
        }
    }

    alpha(channel:string, sender:string, message:string, norbert:Norbert) {
        this.log.trace({
            alpha: {
                channel: channel,
                "requested by": sender,
                message: message
            }
        });

        this.client.query(message, function(err, results) {
            if(err != null) {
                norbert.client.say(channel, "error");
                this.log.error({err:err});
            }

            for(const result of results) {
                if(result.hasOwnProperty('title') && result.title == 'Result'
                    && result.hasOwnProperty('subpods') &&
                        result.subpods.length > 0
                ) {
                    let text = result.subpods[0].text;
                    norbert.client.say(channel, template('WolframAlpha.fetched', {text}));
                }
            }
        });
    }
}