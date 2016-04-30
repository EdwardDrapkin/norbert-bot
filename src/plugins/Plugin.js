// @flow

import Norbert from 'lib/Norbert';

const EVENT_TOKEN = "CHANMSG|PRIVMSG|JOIN|INVITE|TOPIC|PART|KICK|QUIT|NICK";

export default class Plugin {
    receiverMatches:RegExp;

    constructor() {
        this.receiverMatches = /.*/;
    }

    subscribe(norbert:Norbert) {
        norbert.client.on('CHANMSG', (data) => {
            console.log(data);

            if(data.receiver.match(this.receiverMatches)) {
                this.processChanMsg(data.receiver, data.sender, data.message, client);
            }
        });
    }

    init(norbert:Norbert) {}
    reset(norbert:Norbert) {}
}