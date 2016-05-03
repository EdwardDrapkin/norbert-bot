// @flow

import SimpleChanDaemonPlugin from 'plugins/SimpleChanDaemonPlugin';
import Norbert from 'lib/Norbert';
import MetaInspector from 'node-metainspector';

export default class UrlTitlePlugin extends SimpleChanDaemonPlugin {
    timeout:Number;

    constructor(timeout:Number) {
        super();
        this.timeout = timeout;
    }

    getTriggers() :[ (word:string, sender:string, channel:string) => false|(channel:string, sender:string, message:string, client:Norbert, triggered:string)=>void] {
        return [
            this.isUrl
        ];
    }

    isUrl(word:string, sender:string, channel:string) :false|(channel:string, sender:string, message:string, client:Norbert, triggered:string)=>void {
        return word.match(/[^\b]+\.[a-z]{2,6}/i) != null ? this.getUrlTitle : false;
    }

    getUrlTitle(channel:string, sender:string, message:string, client:Norbert, triggered:string) {
        let inspector = new MetaInspector(triggered, {timeout: this.timeout});

        inspector.on("fetch", function() {
            client.client.say(channel, `<${sender}> ${triggered} - ${inspector.title.trim()}`)
        });

        inspector.on("error", () => {});

        inspector.fetch();
    }

    getHelp() {
        return {
            overview: "Gets titles from URLs.",
            commands: {}
        };
    }

    getName() {
        return "UrlTitle";
    }
}