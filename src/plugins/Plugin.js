// @flow

import Norbert from 'lib/Norbert';

const EVENT_TOKEN = "CHANMSG|PRIVMSG|JOIN|INVITE|TOPIC|PART|KICK|QUIT|NICK";

export default class Plugin {
    receiverMatches:RegExp;

    constructor() {
        this.receiverMatches = /.*/;
    }


    init(norbert:Norbert) {}
    reset(norbert:Norbert) {}
    subscribe(norbert:Norbert) {}
}