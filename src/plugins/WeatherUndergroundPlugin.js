// @flow

import SimpleChanMsgPlugin from 'plugins/SimpleChanMsgPlugin';
import Wunderground from 'node-weatherunderground';
import Norbert from 'lib/Norbert';

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
        return {
            overview: "Weather Underground Plugin",
            commands: {
                "weather" : "Gets the weather, shocking!"
            }
        }
    }

    getCommands() {
        return {
            weather: this.getWeather.bind(this)
        }

    }

    getWeather(channel:string, sender:string, message:string, norbert:Norbert) {
        this.client.conditions({city: message}, (err, data) => {
            norbert.client.say(channel, this.getWeatherConditionsString(data));
        });
    }

    getWeatherConditionsString(data:Object) {
        let location = data.observation_location.full;
        let temp = data.temperature_string;
        let observation = data.observation_time;
        let weather = data.weather;
        let humidity = data.relative_humidity;
        let wind = data.wind_string.replace('From', 'from');
        let feelsLike = data.feelslike_string;
        let url = data.forecast_url;

        return `Current conditions: ${weather} / ${temp} [feels like ${feelsLike}] `
            + ` / ${humidity} humidity / Wind ${wind} / ${observation} at ${location}`
            + ` / More at ${url}`;
    }
}