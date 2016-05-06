// @flow

import SimpleChanDaemonPlugin from 'plugins/SimpleChanDaemonPlugin';
import Norbert from 'lib/Norbert';
import scrape from 'html-metadata';

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

    getUrlTitle(channel:string, sender:string, message:string, norbert:Norbert, triggered:string) {
        scrape(triggered, (err, results) => {
            if(!err && results.hasOwnProperty('general') && results.general.hasOwnProperty('title')) {
                norbert.client.say(channel, `<${sender}> ${results.general.title.trim()}`)
            }
        });
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