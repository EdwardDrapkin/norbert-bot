// @flow

import google from 'google';
import googl from 'goo.gl';
import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Norbert from 'lib/Norbert';

export default class GooglePlugin extends SimpleChanMsgPlugin {
    constructor(apiKey:string) {
        super();
        google.resultsPerPage = 11;
        googl.setKey(apiKey);
    }

    getName() {
        return "Google";
    }

    getHelp() {
        return {
            overview: "Ask the Googleplex!",
            commands: {
                google: "query - do a search.",
                g: "query - do a search, bruh."
            }
        }
    }

    getCommands() {
        return {
            g: this.googleQuery.bind(this, 1),
            google: this.googleQuery.bind(this, 3)
        }
    }

    googleQuery(numResults:number, channel:string, sender:string, message:string, norbert:Norbert) {
        let count = 0;

        google(message, (err, results) => {
            if(err != null) {
                norbert.client.say(channel, "error!");
                console.log(err);
                return;
            }

            let links = [];

            for(let link of results.links) {
                if(link.href != null && link.title != null && count < numResults) {
                    links.unshift(link);
                    count++;
                }
            }

            let ress = [];
            googl.shorten(results.url)
                .then((shortened) => {
                    ress.push(`Google Search results for "${results.query}" - ${shortened}`);
                    this.shorten(links, ress, 0, channel, sender, message, norbert);
                })
        });
    }

    shorten(links:[{title:string,href:string}], results:[string], num:number, channel:string, sender:string, message:string, norbert:Norbert) {
        if(links.length > 0) {
            let link = links.pop();

            googl.shorten(link.href)
                .then((shortened) => {
                    let title = this.shortenPhrase(link.title);
                    results.push(` - (${++num}) ${title} <${shortened}>`);
                    this.shorten(links, results, num, channel, sender, message, norbert);
                });
        } else {
            if(results.length > 2) {
                for(let msg of results) {
                    norbert.client.say(channel, msg);
                }
            } else {
                norbert.client.say(channel, results.join(" "));
            }

        }

    }

    shortenPhrase(phrase:string) {
        let words = phrase.split(/\s+/);
        if(words.length > 8) {
            return `${words[0]} ${words[1]} ${words[2]}...`
        } else {
            return phrase;
        }
    }
}