import {Router} from 'express';
import axios from 'axios';
import {safeAsyncRoute} from "../middleware/safe-async-route";
import {verifyUserPermissions} from "../middleware/users";
import {weatherLogger} from "../logger";

export const router = Router();
router.use(verifyUserPermissions);
const cache = require('../cache')('weather');
const {LOCATION_LATITUDE, LOCATION_LONGITUDE} = process.env;

const WEATHER_DATA_STALE_TIME = 1000 * 60 * 5; // five minutes

class Weather {
	constructor() {
		this.fetchWeatherData();
	}
	async fetchWeatherData() {
		try {
			if (!cache.timestamp || Date.now() - cache.timestamp > WEATHER_DATA_STALE_TIME) {
				weatherLogger.debug(`data stale, refreshing (${new Date().toLocaleString()})`);

				cache.weather = (await axios.get(`https://api.tomorrow.io/v4/timelines`, {
					params: {
						apikey: process.env.TOMORROW_API_KEY,
						location: [LOCATION_LATITUDE, LOCATION_LONGITUDE].join(','),
						units: 'imperial',
						timesteps: ['current', '1h', '1d'].join(','),
						fields: [
							"precipitationIntensity",
							"precipitationProbability",
							"precipitationType",
							"windSpeed",
							"windGust",
                            "sunriseTime",
							"sunsetTime",
							"temperature",
							"temperatureApparent",
							"cloudCover",
							"cloudBase",
							"cloudCeiling",
							"weatherCode",
						].join(',')
					}
				})).data

				cache.alerts = (await axios.get(`https://api.weather.gov/alerts/active?point=${LOCATION_LATITUDE},${LOCATION_LONGITUDE}`)).data.features

				cache.timestamp = Date.now();
			}
			return {
				weather: cache.weather.data.timelines,
				alerts: cache.alerts
			}
		} catch(error) {
			weatherLogger.error({error})
		}
	}
}

const weather = new Weather();

router.get('/', safeAsyncRoute(async (req, res) => {
	res.json(await weather.fetchWeatherData());
}));
