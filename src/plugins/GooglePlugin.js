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

        const googleSearch:Object = {
            "requested by": sender,
            channel: channel,
            message: message,
        };

        this.log.trace({
            googleRequest: {
                query: message
            }
        });

        google(message, (err, results) => {
            if(err && Object.keys(err).length > 0) {
                norbert.client.say(channel, "error!");
                this.log.error({err, googleSearch});
                return;
            }

            const links = [];

            for(const link of results.links) {
                if(link.href != null && link.title != null && count < numResults) {
                    links.unshift(link);
                    count++;
                }
            }

            googleSearch.links = links;

            const ress = [];
            googl.shorten(results.url).then((shortened) => {
                ress.push(`Google Search results for "${results.query}" - ${shortened}`);
                this.shorten(links, ress, 0, channel, sender, message, norbert, googleSearch);
            }).catch(err => {
                norbert.client.say(channel, `Error!2`);
                this.log.error({err,googleSearch});
            });
        });
    }

    shorten(links:[{title:string,href:string}], results:[string], num:number, channel:string, sender:string,
        message:string, norbert:Norbert, googleSearch:Object) {
        if(links.length > 0) {
            const link = links.pop();

            this.log.trace({shortening: {
                link: link.href
            }});

            googl.shorten(link.href).then((shortened) => {
                const title = this.shortenPhrase(link.title);
                results.push(` - (${++num}) ${title} <${shortened}>`);

                this.shorten(links, results, num, channel, sender, message, norbert, googleSearch);
            }).catch(err => {
                norbert.client.say(channel, `Error!3`);
                this.log.error({err, googleSearch});
            });
        } else {
            if(results.length > 2) {
                for(const msg of results) {
                    norbert.client.say(channel, msg);
                }
            } else {
                norbert.client.say(channel, results.join(""));
            }

            this.log.trace({googleSearch});
        }

    }

    shortenPhrase(phrase:string) {
        const words = phrase.split(/\s+/);
        if(words.length > 8) {
            return `${words[0]} ${words[1]} ${words[2]}...`
        } else {
            return phrase;
        }
    }
}