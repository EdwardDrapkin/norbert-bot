// @flow
import EventEmitter from 'events';
import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Spotify from 'spotify-web-api-node';
import template from 'lib/template';
import Norbert from 'lib/Norbert';
import {Client} from 'irc';
import Express from 'express';

export default class SpotifyPlugin extends SimpleChanMsgPlugin {
    spotify: Spotify;
    client: (Client & EventEmitter.EventEmitter);
    sharedPlaylistId: string;
    userId: string;
    token: string;
    oAuthPoller: number = 0;
    express: Express;

    constructor(clientId: string, clientSecret: string, meta: {[k:string]: string}) {
        super();

        this.spotify = new Spotify({clientId, clientSecret, redirectUri: meta.api});
        this.sharedPlaylistId = meta.sharedPlaylistId;
        this.userId = meta.userId;
    }

    init(norbert: Norbert) {
        super.init(norbert);
        this.express = norbert.express;
        this.client = norbert.client;
        this.setupOAuthCallback();
    }

    getName() {
        return "Spotify";
    }

    getHelp() {
        return template.getObject('Spotify.help');
    }

    getCommands() {
        return {
            'spotArtist': this.searchArtists.bind(this),
            'spotTrack': this.searchTracks.bind(this),
            'playlist': this.getPlaylist.bind(this),
            'renamePlaylist': this.renamePlaylist.bind(this),
            'listTrack': this.addSongToPlaylist.bind(this),
            'expireSpotifyAuth': this.shutdownOAuthPolling.bind(this),
            'startSpotifyAuth': this.getAuthURL.bind(this),
            'song': this.randomSong.bind(this)
        }
    }

    randomSong(channel: string, sender: string, message: string, norbert: Norbert) {
        this.spotify.getPlaylist(this.userId, this.sharedPlaylistId).then(results => {
            const tracks = results.body.tracks.items;
            const max = tracks.length;
            const min = 0;
            const trackNum = Math.floor(Math.random() * (max - min)) + min;
            const track = tracks[trackNum];
            const details = {
                artist: track.track.artists[0].name,
                name: track.track.name,
                album: track.track.album.name,
                uri: track.track.uri,
                sender
            };

            norbert.client.say(channel, template('Spotify.song', details));
        }).catch(e => console.log(e));
    }

    setupOAuthCallback() {
        this.log.trace("Adding OAuth callback for spotify at /spotify/callback");
        this.express.get('/spotify/callback', (req, res, next) => {
            this.token = req.query.code;
            const details : {sender: string, channel: string, token: string} = {
                token: req.query.code,
                sender: '',
                channel: ''
            };

            Object.assign(details, JSON.parse(decodeURIComponent(req.query.state)));

            this.log.trace(`Found OAuth token: ${this.token}`);
            res.json("Thanks!").end();

            this.setupOAuthPolling(details)
        });
    }

    setupOAuthPolling(details: {sender: string, channel: string}) {
        const {sender, channel} = details;

        this.spotify.authorizationCodeGrant(this.token).then(data => {
            this.spotify.setAccessToken(data.body['access_token']);
            this.spotify.setRefreshToken(data.body['refresh_token']);

            this.client.say(channel, template('Spotify.authStart', {sender}));

            this.oAuthPoller = setInterval(() => {
                this.spotify.refreshAccessToken().then(data => {
                    const tokenExpirationEpoch = (new Date().getTime() / 1000) + data.body['expires_in'];
                    this.log.trace('Refreshed token. It now expires in ' + Math.floor(
                            tokenExpirationEpoch - new Date().getTime() / 1000) + ' seconds!')
                }).catch(err => this.log.error(err))
            }, 1000 * 15 * 60);
        }).catch(err => this.log.error(err));
    }

    shutdownOAuthPolling() {
        clearInterval(this.oAuthPoller);
    }

    getAuthURL(channel: string, sender: string, message: string, norbert: Norbert) {
        const scopes = [
            'playlist-read-collaborative',
            'playlist-read-private',
            'playlist-modify-public',
            'playlist-modify-private'
        ];

        norbert.client.say(channel, "The bot owner needs to click this link: " +
            this.spotify.createAuthorizeURL(scopes, encodeURIComponent(JSON.stringify({channel, sender}))));
    }

    addSongToPlaylist(channel: string, sender: string, message: string, norbert: Norbert) {
        const songs = message.split(' ').filter(e => e.match(/^spotify:track/));
        this.spotify.addTracksToPlaylist(this.userId, this.sharedPlaylistId, songs).then(() => {
            norbert.client.say(channel, template('Spotify.playlistTrackAdded', {sender, songs: songs.join(' ')}));
        }).catch(err => this.log.error({err}));
    }

    renamePlaylist(channel: string, sender: string, message: string, norbert: Norbert) {
        this.spotify.changePlaylistDetails(this.userId, this.sharedPlaylistId, {name: message}).then(() => {
            norbert.client.say(channel, template('Spotify.playlistUpdated', {name: message}));
        }).catch(err => this.log.error({err}));
    }

    getPlaylist(channel: string, sender: string, message: string, norbert: Norbert) {
        this.spotify.getPlaylist(this.userId, this.sharedPlaylistId).then(results => {
            const playlist = {
                playlist: results.body.name,
                uri: results.body.uri
            };

            norbert.client.say(channel, template('Spotify.playlist', playlist));
        }).catch(e => this.log.error(e));
    }

    searchTracks(channel: string, sender: string, message: string, norbert: Norbert) {
        try {
            this.spotify.searchTracks(message).then(results => {
                const tracks = results.body.tracks.items.map(
                    item => ({
                        album: item.album.name,
                        artist: item.artists[0].name,
                        title: item.name,
                        uri: item.uri
                    })
                );

                norbert.client.say(channel, tracks.splice(0, 3).map(e => template('Spotify.track', e)).join(' '));
            });
        } catch(err) {
            this.log.error({err});
            return {};
        }
    }

    searchArtists(channel: string, sender: string, message: string, norbert: Norbert) {
        try {
            this.spotify.searchArtists(message).then(results => {
                const artists = results.body.artists.items.map(
                    item => ({
                        name: item.name,
                        uri: item.uri,
                        popularity: item.popularity
                    })
                );

                norbert.client.say(channel, artists.splice(0, 3).map(e => template('Spotify.artist', e)).join(' '));
            });
        } catch(err) {
            this.log.error({err});
            return {};
        }
    }

}