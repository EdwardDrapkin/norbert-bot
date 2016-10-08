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
import dns from 'dns';
import template from 'lib/template';

temp.track();
const request = (...args) => {
    return _request.defaults({
        gzip: true,
        encoding: null,
        headers: {
            'User-Agent': 'norbert'
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

export type handler = (str: string, response: http.IncomingMessage, body: string, announce: (msg: string)=>void)=>boolean;
export type norbertChanMethod = (channel: string, sender: string, message: string, client: Norbert, triggered: string)=>void;
export type trigger = (word: string, sender: string, channel: string) => false|norbertChanMethod;

export default class UrlTitlePlugin extends SimpleChanDaemonPlugin {
    handlers: [ handler ];

    init(norbert:Norbert) {
        super.init(norbert);

        this.handlers = [
            this.imgurGifVHandler.bind(this),
            this.imageHandler.bind(this),
            this.videoHandler.bind(this),
            this.titleTagHandler.bind(this)
        ]
    }


    addHandler(handler:handler) {
        this.handlers.unshift(handler);
    }

    getTriggers() :[trigger] {
        return [
            this.isUrl.bind(this)
        ];
    }

    getHelp() {
        return template.getObject('UrlTitle.help');
    }

    getName() {
        return "UrlTitle";
    }

    isUrl(word:string, sender:string, channel:string) : false|norbertChanMethod {
        return word.match(/[^\b]+\.[a-z]{2,6}/i) != null ? this.getUrlTitle.bind(this) : false;
    }

    getUrlTitle(channel:string, sender:string, message:string, norbert:Norbert, triggered:string) {
        if(!triggered.match(/\/\//)) {
            triggered = `http://${triggered}`;
        }

        const parsed = url.parse(triggered);

        if(!parsed.hostname) {
            return;
        }

        dns.lookup(parsed.hostname, 4, (err, address) => {
            if(err) {
                this.log.warn(err);
                return;
            }

            if(address === '127.0.0.1' || address === '::1') {
                this.log.warn('Address resolved to localhost: ' + triggered);
                return;
            }

            _request({gzip: true, method: 'HEAD', uri: url.parse(triggered), timeout: 15000},
                (err, headResponse, headBody) => {

                    if(err) {
                        this.log.error(err);
                        return;
                    }

                    let status = false;
                    let i = -1;

                    while(status == false && i + 1 < this.handlers.length) {
                        status = this.handlers[++i](triggered, headResponse, headBody, (msg) => {
                            norbert.client.say(channel, template('UrlTitle.title', {sender, msg}));
                        });
                    }
                });
        });
    }

    videoHandler(str:string, resp:http.IncomingMessage, body:string, announce:(msg:string)=>void):boolean {
        if(resp && resp.headers && resp.headers['content-type'] && resp.headers['content-type'].startsWith('video/')) {
            const tmp = str.replace(/[\W]/ig, '_');

            temp.open(tmp, (err, tempPath) => {
                _request.get(str).on('end', () => {
                    mediainfo(tempPath.path).then(res => {
                        let dimensions = '';
                        try {
                            for(let i = 0; i < res[0].tracks.length; i++) {
                                const track = res[0].tracks[i];
                                if(track.type == 'Video') {
                                    const height = res[0].tracks[0].height.replace(' pixels', '');
                                    const width = res[0].tracks[0].width.replace(' pixels', '');
                                    dimensions = `${height}x${width}`;
                                    break;
                                }
                            }
                        } catch(e) {}

                        let attrs = {
                            fileSize: res[0].file_size,
                            duration: res[0].duration,
                            dimensions: dimensions
                        };

                        announce(template('UrlTitle.mp4', attrs));
                    }).catch(err => {
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
        if(resp && resp.headers && resp.headers['content-type'] && resp.headers['content-type'].startsWith('image/')) {
            request(str, (error, resp, _body) => {
                if(!error) {
                    try {
                        let buffer;

                        if(resp.buffer) {
                            buffer = resp.buffer;
                        } else {
                            buffer = _body;
                        }
                        const image = imageSize(buffer);
                        const humanSize = resp.headers['content-length'] > 0 ?
                                          filesize(resp.headers['content-length']) : '';

                        const message = template("UrlTitle.image", {
                            height: image.height,
                            width: image.width,
                            type: image.type,
                            humanSize: humanSize
                        });

                        announce(message);
                    } catch(err) {
                        this.log.error({err});
                    }
                }
            });

            return true;
        }

        return false;
    }

    titleTagHandler(str:string, resp:http.IncomingMessage, body:string, announce:(msg:string)=>void):boolean {
        if(resp && resp.headers && resp.headers['content-type'] && resp.headers['content-type'].startsWith('text/')) {
            request(str, (error, resp, _body) => {
                if(!error) {
                    const title = cheerio.load(_body)('title');
                    if(title) {
                        announce(title.text().trim().replace('/\s+/g', ' '));
                    }
                }
            });

            return true;
        }

        return false;
    }
}