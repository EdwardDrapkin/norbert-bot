// @flow

import Plugin from 'plugins/Plugin';
import UrlTitlePlugin from 'plugins/UrlTitlePlugin';
import Norbert from 'lib/Norbert';
import template from 'lib/template';
import YouTube from 'youtube-node';
import http from 'http';
import humanize from 'humanize';

export default class YouTubePlugin extends Plugin {
    apiKey:string;
    client:YouTube;

    constructor(apiKey:string) {
        super();
        this.apiKey = apiKey;
        this.client = new YouTube();
        this.client.setKey(this.apiKey);
    }

    init(norbert:Norbert) {
        super.init(norbert);
        this.requirePlugin('UrlTitle');

        let urlTitle = norbert.plugins['UrlTitle'];

        if(urlTitle && urlTitle.constructor === UrlTitlePlugin) {
            // $FlowIgnore
            urlTitle.addHandler(this.youtubeHandler.bind(this));
        } else {
            throw "Can't find URL plugin!";
        }
    }

    getName() {
        return "YouTube";
    }

    getHelp() {
        return template.getObject('YouTube.help');
    }

    youtubeHandler(str:string, resp:http.IncomingMessage, body:string, announce:(msg:string)=>void):boolean {
        if(!str.match('youtu.be') && !str.match('youtube.com')) {
            return false;
        }

        let traceDetails:Object = {
            triggered: str
        };

        str = str.replace(/.+?(?:(?:v=)|(?:youtu\.be\/))(.+)/, '$1');

        traceDetails.parsedId = str;

        this.client.getById(str, (err, result) => {
            if(err) {
                this.log.error({err: err});
                announce(template('error'));
            } else {
                if(result.items.length > 0) {
                    let attrs = {
                        title: result.items[0].snippet.title,
                        duration: result.items[0].contentDetails.duration.replace('PT', '').replace(/([HMS])/g,
                            ':').replace(/:$/, '').replace(/:(\d)(?!\d)/g, ':0$1'),
                        views: humanize.numberFormat(result.items[0].statistics.viewCount, 0),
                        likes: humanize.numberFormat(result.items[0].statistics.likeCount, 0)
                    };

                    traceDetails.announceAttrs = attrs;
                    announce(template('YouTube.video', attrs));
                }
            }

            this.log.trace({YouTube: traceDetails});
        });

        return true;
    }
}