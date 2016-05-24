// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Wunderground from 'node-weatherunderground';
import Norbert from 'lib/Norbert';
import template from 'lib/template';

export default class WeatherUndergroundPlugin extends SimpleChanMsgPlugin {
    client:Wunderground;

    constructor(apiKey:string) {
        super();
        this.client = new Wunderground(apiKey);
    }

    getName() {
        return "WeatherUnderground";
    }

    getHelp() {
        return template.getObject('WeatherUnderground.help');
    }

    getCommands() {
        return {
            weather: this.getWeather.bind(this),
            w: this.getWeather.bind(this),
            setWeather: this.saveUser.bind(this)
        }

    }

    init(norbert:Norbert) {
        super.init(norbert);
        this.log.trace({
            tableInit: {
                table: 'weather'
            }
        });
        norbert.db.run("CREATE TABLE IF NOT EXISTS weather (name TEXT PRIMARY KEY, weather TEXT)");
    }

    reset(norbert:Norbert) {
        norbert.db.run("TRUNCATE TABLE weather");
    }

    saveUser(channel:string, sender:string, message:string, norbert:Norbert) {
        const user = sender;
        const weather = message;

        this.log.trace({
            saveUser: {
                channel: channel,
                "requested by": sender,
                message: message
            }
        });

        const stmt = norbert.db.prepare("INSERT OR REPLACE INTO weather (name, weather) VALUES (?, ?)");
        stmt.run([user, weather], (err) => {
            if(err) {
                norbert.client.say(channel, template('error'));
            } else {
                norbert.client.say(channel, template('WeatherUnderground.userSaved', {sender, weather}));
            }
        });
    }

    lookupUser(channel:string, sender:string, message:string, norbert:Norbert) {
        this.log.trace({
            lookupUser: {
                channel: channel,
                "requested by": sender,
                message: message
            }
        });
        const stmt = norbert.db.prepare("SELECT * FROM weather WHERE name=(?)");
        stmt.all([sender], (err, rows) => {
            if(rows.length > 0) {
                const weather = rows[0].weather;
                return this.getWeather(channel, sender, weather, norbert);
            } else {
                norbert.client.say(channel, template('WeatherUnderground.unknownUser', {sender}));
            }
        });
    }

    getWeather(channel:string, sender:string, message:string, norbert:Norbert) {
        this.log.trace({
            getWeather: {
                channel: channel,
                "requested by": sender,
                message: message
            }
        });

        if(!message.trim()) {
            return this.lookupUser(channel, sender, message, norbert);
        }

        this.client.conditions({city: message}, (err, data) => {
            let conditions = this.getWeatherConditionsString(data);
            if(conditions === false) {
                conditions = template('WeatherUnderground.noConditions', {message});
            }

            norbert.client.say(channel, conditions);
        });
    }

    getWeatherConditionsString(data:Object) {
        if(!data ||
            !data.hasOwnProperty('observation_location') ||
            !data.hasOwnProperty('temperature_string') ||
            !data.hasOwnProperty('observation_time') ||
            !data.hasOwnProperty('weather') ||
            !data.hasOwnProperty('relative_humidity') ||
            !data.hasOwnProperty('wind_string') ||
            !data.hasOwnProperty('feelslike_string') ||
            !data.hasOwnProperty('forecast_url')
        ) {
            return false;
        }

        const location = data.observation_location.full;
        const temp = data.temperature_string;
        const observation = data.observation_time;
        const weather = data.weather;
        const humidity = data.relative_humidity;
        const wind = data.wind_string.replace('From', 'from');
        const feelsLike = data.feelslike_string;
        const url = data.forecast_url;

        return template('WeatherUnderground.currentConditions', {
                weather, temp, feelsLike, wind, humidity, observation, location, url
            });
    }
}
