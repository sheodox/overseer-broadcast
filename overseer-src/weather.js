const router = require('express').Router(),
	config = require('../config'),
	{apiKey, latitude, longitude} = config.weather,
	{promisify} = require('util'),
	cache = require('./cache')('weather'),
	request = promisify(require('request'));

const WEATHER_DATA_STALE_TIME = 1000 * 60 * 5; // five minutes

class Weather {
	constructor() {
		this.fetchWeatherData();
	}
	async fetchWeatherData() {
		try {
			if (!cache.timestamp || Date.now() - cache.timestamp > WEATHER_DATA_STALE_TIME) {
				this.log(`weather data stale, refreshing (${new Date().toLocaleString()})`);

				cache.timestamp = Date.now();
				cache.weather = JSON.parse(
					(await request(`https://api.darksky.net/forecast/${apiKey}/${latitude},${longitude}`)).body
				);
			}
			return cache.weather;
		} catch(e) {
			console.log(e);
		}
	}
	log(msg) {
		console.log(`WEATHER - ${msg}`)
	}
}


const weather = new Weather();

router.get('/weather', async (req, res) => {
	res.json(await weather.fetchWeatherData());
});
module.exports = router;
