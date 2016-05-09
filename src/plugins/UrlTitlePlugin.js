// @flow

import SimpleChanDaemonPlugin from 'plugins/SimpleChanDaemonPlugin';
import Norbert from 'lib/Norbert';
import url from 'url';
import _request from 'request';
import cheerio from 'cheerio';
import filesize from 'filesize';
import imageSize from 'image-size';
import mediainfo from 'mediainfo-q';
import temp from 'temp';
import fs from 'fs';
import http from 'http';

temp.track();
const request = (...args) => {
    return _request.defaults({
        gzip: true,
        headers: {
            'User-Agent': 'norbert',
        }
    })(...args).on('response', response => {
        let buffer = false;

        response.on('data', (chunk) => {
            buffer = Buffer.concat(buffer ? [buffer, chunk] : [chunk]);

            if(buffer.length > 1024 * 25) { //we've fetched a few kb
                response.buffer = buffer;
                response.destroy();
            }
        });
    });
};

export default class UrlTitlePlugin extends SimpleChanDaemonPlugin {
    timeout:Number;
    handlers: [
        (str:string, response:http.IncomingMessage, body: string, announce:(msg:string)=>void)=>boolean
    ];

    constructor() {
        super();

        this.handlers = [
            this.imgurGifVHandler.bind(this),
            this.imageHandler.bind(this),
            this.videoHandler.bind(this),
            this.fallbackTextHandler.bind(this)
        ]
    }

    getTriggers() :[ (word:string, sender:string, channel:string) => false|(channel:string, sender:string, message:string, client:Norbert, triggered:string)=>void] {
        return [
            this.isUrl
        ];
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

    isUrl(word:string, sender:string, channel:string) :false|(channel:string, sender:string, message:string, client:Norbert, triggered:string)=>void {
        return word.match(/[^\b]+\.[a-z]{2,6}/i) != null ? this.getUrlTitle : false;
    }

    getUrlTitle(channel:string, sender:string, message:string, norbert:Norbert, triggered:string) {
        if(!triggered.match(/\/\//)) {
            triggered = `http://${triggered}`;
        }

        _request({gzip: true, method: 'HEAD', uri: url.parse(triggered), timeout: 15000}, (err, headResponse, headBody) => {
            if(err) {
                console.error(err);
                return;
            }

            let status = false;
            let i = -1;

            while(status == false && i + 1 < this.handlers.length) {
                status = this.handlers[++i](triggered, headResponse, headBody, (msg) => {
                    norbert.client.say(channel, `<${sender}> ${msg}`);
                });
            }
        });
    }

    videoHandler(str:string, resp:http.IncomingMessage, body:string, announce:(msg:string)=>void):boolean {
        if(resp.headers['content-type'].startsWith('video/')) {
            let tmp = str.replace(/[\W]/ig, '_');

            temp.open(tmp, (err, tempPath) => {
                _request.get(str).on('end', () => {
                    mediainfo(tempPath.path).then(res => {
                        let dimensions = '';
                        try {
                            for(let i = 0; i < res[0].tracks.length; i++) {
                                let track = res[0].tracks[i];
                                if(track.type == 'Video') {
                                    let height = res[0].tracks[0].height.replace(' pixels', '');
                                    let width = res[0].tracks[0].width.replace(' pixels', '');
                                    dimensions = `${height}x${width}`;
                                    break;
                                }
                            }
                        } catch(e) {}
                        announce(`video/mp4: ${res[0].duration}, ${dimensions}, ${res[0].file_size}`);                    }).catch(err => {
                        console.error(err);
                    });
                }).pipe(fs.createWriteStream(tempPath.path));
            })

            return true;
        }

        return false;
    }

    imgurGifVHandler(str:string, resp:http.IncomingMessage, body:string, announce: (msg:string)=>void) : boolean {
        if(str.match(/imgur.+?gifv$/)) {
            resp.headers['content-type'] = 'video/mp4';
            return this.videoHandler(str.replace('gifv', 'mp4'), resp, body, announce);
        }

        return false;
    }

    imageHandler(str:string, resp:http.IncomingMessage, body:string, announce:(msg:string)=>void):boolean {
        if(resp.headers['content-type'].startsWith('image/')) {
            request(str, (error, resp, _body) => {
                if(!error) {
                    let image = imageSize(resp.buffer);
                    let humanSize = resp.headers['content-length'] > 0 ?
                                    filesize(resp.headers['content-length']) : '';
                    let message = `${image.height}x${image.width} ${image.type} - ${humanSize}`;

                    announce(message);
                }
            });

            return true;
        }

        return false;
    }

    fallbackTextHandler(str:string, resp:http.IncomingMessage, body:string, announce:(msg:string)=>void):boolean {
        if(resp.headers['content-type'].startsWith('text/')) {
            request(str, (error, resp, _body) => {
                if(!error) {
                    let title = cheerio.load(_body)('title').text().trim();
                    if(title != "") {
                        announce(title);
                    }
                }
            });

            return true;
        }

        return false;
    }
}