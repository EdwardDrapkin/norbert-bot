// @flow

import SimpleChanDaemonPlugin from 'plugins/SimpleChanDaemonPlugin';
import Norbert from 'lib/Norbert';
import request from 'request';
import cheerio from 'cheerio';
import filesize from 'filesize';
import imageSize from 'image-size';

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
        let contentType = '';
        let size = 0;
        let humanSize = '';
        let image = {};

        request({method: 'HEAD', uri: triggered}, (err, headResponse, headBody) => {
            if(err) {
                return;
            }

            contentType = headResponse.headers['content-type'];
            size = headResponse.headers['content-length'] || 0;
            humanSize = filesize(size);

            let buffer;
            request(triggered, (error, response, body) => {
                if(!error) {
                    if(contentType.startsWith('text/')) {
                        let title = cheerio.load(buffer.toString())('title').text().trim();
                        if(title != "") {
                            norbert.client.say(channel, `<${sender}> ${title}`);
                        }
                    } else if(contentType.startsWith('image/')) {
                        let image = imageSize(buffer);
                        let message = `<${sender}> ` +
                            `${image.height}x${image.width} ${image.type} - ${humanSize}`;

                        norbert.client.say(channel, message);
                    } else {
                        let message = `<${sender}> ` +
                            `${contentType} - ${humanSize}`;
                        norbert.client.say(channel, message);
                    }
                }
            }).on('response', response => {
                response.on('data', (chunk) => {
                    buffer = Buffer.concat(buffer ? [buffer, chunk] : [chunk]);

                    if(buffer.length > 1024 * 5) { //we've fetched a few kb
                        response.destroy();
                    }
                });
            });
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