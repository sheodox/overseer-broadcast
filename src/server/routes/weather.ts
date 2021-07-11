import {Router} from 'express';
import axios from 'axios';
import {safeAsyncRoute} from "../middleware/safe-async-route";
import {verifyUserPermissions} from "../middleware/users";

export const router = Router();
router.use(verifyUserPermissions);
const cache = require('../cache')('weather');
const {LOCATION_LATITUDE, LOCATION_LONGITUDE} = process.env;

const WEATHER_DATA_STALE_TIME = 1000 * 60 * 5; // five minutes

const debugAlerts =[
		{
			"id": "https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.2914a980d0aa6eda89196245546bf227fae208e9.001.1",
			"type": "Feature",
			"properties": {
				"@id": "https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.2914a980d0aa6eda89196245546bf227fae208e9.001.1",
				"@type": "wx:Alert",
				"id": "urn:oid:2.49.0.1.840.0.2914a980d0aa6eda89196245546bf227fae208e9.001.1",
				"areaDesc": "Koochiching; North St. Louis; Northern Cook/Northern Lake; North Itasca; Central St. Louis; Southern Lake/North Shore; Southern Cook/North Shore; South Itasca; Northern Aitkin; South Aitkin; Carlton/South St. Louis",
				"geocode": {
					"SAME": [
						"027071",
						"027137",
						"027031",
						"027075",
						"027061",
						"027001",
						"027017"
					],
					"UGC": [
						"MNZ010",
						"MNZ011",
						"MNZ012",
						"MNZ018",
						"MNZ019",
						"MNZ020",
						"MNZ021",
						"MNZ026",
						"MNZ035",
						"MNZ036",
						"MNZ037"
					]
				},
				"affectedZones": [
					"https://api.weather.gov/zones/forecast/MNZ010",
					"https://api.weather.gov/zones/forecast/MNZ011",
					"https://api.weather.gov/zones/forecast/MNZ012",
					"https://api.weather.gov/zones/forecast/MNZ018",
					"https://api.weather.gov/zones/forecast/MNZ019",
					"https://api.weather.gov/zones/forecast/MNZ020",
					"https://api.weather.gov/zones/forecast/MNZ021",
					"https://api.weather.gov/zones/forecast/MNZ026",
					"https://api.weather.gov/zones/forecast/MNZ035",
					"https://api.weather.gov/zones/forecast/MNZ036",
					"https://api.weather.gov/zones/forecast/MNZ037"
				],
				"sent": "2021-07-09T17:29:00-05:00",
				"effective": "2021-07-09T16:44:00-05:00",
				"onset": "2021-07-09T16:44:00-05:00",
				"expires": "2021-07-12T06:00:00-05:00",
				"status": "Actual",
				"messageType": "Alert",
				"category": "Met",
				"severity": "Unknown",
				"certainty": "Unknown",
				"urgency": "Unknown",
				"event": "Air Quality Alert",
				"sender": "w-nws.webmaster@noaa.gov",
				"senderName": "NWS Duluth MN",
				"headline": "Air Quality Alert issued July 9 at 4:44PM CDT by NWS Duluth MN",
				"description": "CCC\n\n* WHAT...The Minnesota Pollution Control Agency has issued an Air\nQuality Alert for fine particle pollution. The Air Quality\nIndex (AQI) is expected to reach the Orange or Unhealthy for\nSensitive Groups category.\n\n* WHERE...northeast Minnesota.\n\n* WHEN...From 6 AM CDT Saturday through 6 AM CDT Monday.\n\n* IMPACTS...Sensitive groups, such as people with lung disease\n(including asthma), heart disease, and children and older\nadults, may experience health effects.\n\n* ADDITIONAL DETAILS...Smoke from wildfires located north of the\nCanadian border in Ontario and Manitoba will be transported by\nnortherly winds circulating around high pressure into the\nnortheast part of Minnesota. Heavy smoke is expected to\narrive Saturday morning and remain over the area into Monday\nmorning. During this time, fine particle levels are expected to\nbe in the Orange AQI category, a level that is considered\nunhealthy for sensitive groups. The lake breeze along Lake\nSuperior will help bring heavier smoke down towards the\nsurface, then the smoke will tend to drift westward towards\nnorth central Minnesota. On Monday, winds will turn out of the\nsouth and steer the smoke northward into Canada.",
				"instruction": "Sensitive groups, such as people with lung disease (including\nasthma), heart disease, and children and older adults, should limit\nprolonged or heavy exertion.\n\nFor information on current air quality conditions in your area and to\nsign-up for daily air quality forecasts and alert notifications by\nemail, text message, phone, or the Minnesota Air mobile app,\nvisit https://www.pca.state.mn.us/air/current-air-quality.\n\nYou can find additional information about health and air quality\nat https://www.pca.state.mn.us/air/why-you-should-care-air-\nquality-and-health.",
				"response": "Monitor",
				"parameters": {
					"PIL": [
						"DLHAQADLH"
					],
					"NWSheadline": [
						"AIR QUALITY ALERT IN EFFECT FROM 6 AM CDT SATURDAY THROUGH 6 AM CDT MONDAY"
					],
					"BLOCKCHANNEL": [
						"EAS",
						"NWEM",
						"CMAS"
					]
				}
			}
		},
		{
			"id": "https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.9aab569582184028114a81b1f16493df40fc5c63.001.1",
			"type": "Feature",
			"properties": {
				"@id": "https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.9aab569582184028114a81b1f16493df40fc5c63.001.1",
				"@type": "wx:Alert",
				"id": "urn:oid:2.49.0.1.840.0.9aab569582184028114a81b1f16493df40fc5c63.001.1",
				"areaDesc": "Koochiching; North St. Louis; Northern Cook/Northern Lake; North Itasca; Central St. Louis; Southern Lake/North Shore; Southern Cook/North Shore; South Itasca; Northern Aitkin; South Aitkin; Carlton/South St. Louis",
				"geocode": {
					"SAME": [
						"027071",
						"027137",
						"027031",
						"027075",
						"027061",
						"027001",
						"027017"
					],
					"UGC": [
						"MNZ010",
						"MNZ011",
						"MNZ012",
						"MNZ018",
						"MNZ019",
						"MNZ020",
						"MNZ021",
						"MNZ026",
						"MNZ035",
						"MNZ036",
						"MNZ037"
					]
				},
				"affectedZones": [
					"https://api.weather.gov/zones/forecast/MNZ010",
					"https://api.weather.gov/zones/forecast/MNZ011",
					"https://api.weather.gov/zones/forecast/MNZ012",
					"https://api.weather.gov/zones/forecast/MNZ018",
					"https://api.weather.gov/zones/forecast/MNZ019",
					"https://api.weather.gov/zones/forecast/MNZ020",
					"https://api.weather.gov/zones/forecast/MNZ021",
					"https://api.weather.gov/zones/forecast/MNZ026",
					"https://api.weather.gov/zones/forecast/MNZ035",
					"https://api.weather.gov/zones/forecast/MNZ036",
					"https://api.weather.gov/zones/forecast/MNZ037"
				],
				"sent": "2021-07-09T16:46:00-05:00",
				"effective": "2021-07-09T16:44:00-05:00",
				"onset": "2021-07-09T16:44:00-05:00",
				"expires": "2021-07-12T06:00:00-05:00",
				"status": "Actual",
				"messageType": "Alert",
				"category": "Met",
				"severity": "Unknown",
				"certainty": "Unknown",
				"urgency": "Unknown",
				"event": "Air Quality Alert",
				"sender": "w-nws.webmaster@noaa.gov",
				"senderName": "NWS Duluth MN",
				"headline": "Air Quality Alert issued July 9 at 4:44PM CDT by NWS Duluth MN",
				"description": "CCB\n\n* WHAT...The Minnesota Pollution Control Agency has issued an Air\nQuality Alert for fine particle pollution. The Air Quality\nIndex (AQI) is expected to reach the Orange or Unhealthy for\nSensitive Groups category.\n\n* WHERE...northeast Minnesota.\n\n* WHEN...From 6 AM CDT Saturday through 6 AM CDT Monday.\n\n* IMPACTS...Sensitive groups, such as people with lung disease\n(including asthma), heart disease, and children and older\nadults, may experience health effects.\n\n* ADDITIONAL DETAILS...Smoke from wildfires located north of the\nCanadian border in Ontario and Manitoba will be transported by\nnortherly winds circulating around high pressure into the\nnortheast part of the Minnesota. Heavy smoke is expected to\narrive Saturday morning and remain over the area into Monday\nmorning. During this time, fine particle levels are expected to\nbe in the Orange AQI category, a level that is considered\nunhealthy for sensitive groups. The lake breeze along Lake\nSuperior will help bring heavier smoke down towards the\nsurface, then the smoke will tend to drift westward towards\nnorth central Minnesota. On Monday, winds will turn out of the\nsouth and steer the smoke northward into Canada.",
				"instruction": "Sensitive groups, such as people with lung disease (including\nasthma), heart disease, and children and older adults, should limit\nprolonged or heavy exertion.\n\nFor information on current air quality conditions in your area and to\nsign-up for daily air quality forecasts and alert notifications by\nemail, text message, phone, or the Minnesota Air mobile app,\nvisit https://www.pca.state.mn.us/air/current-air-quality.\n\nYou can find additional information about health and air quality\nat https://www.pca.state.mn.us/air/why-you-should-care-air-\nquality-and-health.",
				"response": "Monitor",
				"parameters": {
					"PIL": [
						"DLHAQADLH"
					],
					"NWSheadline": [
						"AIR QUALITY ALERT IN EFFECT FROM 6 AM CDT SATURDAY THROUGH 6 AM CDT MONDAY"
					],
					"BLOCKCHANNEL": [
						"EAS",
						"NWEM",
						"CMAS"
					]
				}
			}
		},
		{
			"id": "https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.d6adf08046f1f3001a159775bc1cd2f6198fd70f.001.1",
			"type": "Feature",
			"properties": {
				"@id": "https://api.weather.gov/alerts/urn:oid:2.49.0.1.840.0.d6adf08046f1f3001a159775bc1cd2f6198fd70f.001.1",
				"@type": "wx:Alert",
				"id": "urn:oid:2.49.0.1.840.0.d6adf08046f1f3001a159775bc1cd2f6198fd70f.001.1",
				"areaDesc": "Koochiching; North St. Louis; Northern Cook/Northern Lake; North Itasca; Central St. Louis; Southern Lake/North Shore; Southern Cook/North Shore; South Itasca; Northern Aitkin; South Aitkin; Carlton/South St. Louis",
				"geocode": {
					"SAME": [
						"027071",
						"027137",
						"027031",
						"027075",
						"027061",
						"027001",
						"027017"
					],
					"UGC": [
						"MNZ010",
						"MNZ011",
						"MNZ012",
						"MNZ018",
						"MNZ019",
						"MNZ020",
						"MNZ021",
						"MNZ026",
						"MNZ035",
						"MNZ036",
						"MNZ037"
					]
				},
				"affectedZones": [
					"https://api.weather.gov/zones/forecast/MNZ010",
					"https://api.weather.gov/zones/forecast/MNZ011",
					"https://api.weather.gov/zones/forecast/MNZ012",
					"https://api.weather.gov/zones/forecast/MNZ018",
					"https://api.weather.gov/zones/forecast/MNZ019",
					"https://api.weather.gov/zones/forecast/MNZ020",
					"https://api.weather.gov/zones/forecast/MNZ021",
					"https://api.weather.gov/zones/forecast/MNZ026",
					"https://api.weather.gov/zones/forecast/MNZ035",
					"https://api.weather.gov/zones/forecast/MNZ036",
					"https://api.weather.gov/zones/forecast/MNZ037"
				],
				"sent": "2021-07-09T16:45:00-05:00",
				"effective": "2021-07-09T16:44:00-05:00",
				"onset": "2021-07-09T16:44:00-05:00",
				"expires": "2021-07-12T06:00:00-05:00",
				"status": "Actual",
				"messageType": "Alert",
				"category": "Met",
				"severity": "Unknown",
				"certainty": "Unknown",
				"urgency": "Unknown",
				"event": "Air Quality Alert",
				"sender": "w-nws.webmaster@noaa.gov",
				"senderName": "NWS Duluth MN",
				"headline": "Air Quality Alert issued July 9 at 4:44PM CDT by NWS Duluth MN",
				"description": "CCA\n\n* WHAT...The Minnesota Pollution Control Agency has issued an Air\nQuality Alert for fine particle pollution. The Air Quality\nIndex (AQI) is expected to reach the Orange or Unhealthy for\nSensitive Groups category.\n\n* WHERE...northeast Minnesota.\n\n* WHEN...From 6 AM CDT Saturday through 6 AM CDT Monday.\n\n* IMPACTS...Sensitive groups, such as people with lung disease\n(including asthma), heart disease, and children and older\nadults, may experience health effects.\n\n* ADDITIONAL DETAILS...Smoke from wildfires located north of the\nCanadian border in Ontario and Manitoba will be transported by\nnortherly winds circulating around high pressure into the\nnortheast part of the Minnesota. Heavy smoke is expected to\narrive Saturday morning and remain over the area into Monday\nmorning. During this time, fine particle levels are expected to\nbe in the Orange AQI category, a level that is considered\nunhealthy for sensitive groups. The lake breeze along Lake\nSuperior will help bring heavier smoke down towards the\nsurface, then the smoke will tend to drift westward towards\nnorth central Minnesota. On Monday, winds will turn out of the\nsouth and steer the smoke northward into Canada.\n\nPRECAUTIONARY/PREPARDNESS ACTIONS...\n\nSensitive groups, such as people with lung disease (including\nasthma), heart disease, and children and older adults, should limit\nprolonged or heavy exertion.\n\nFor information on current air quality conditions in your area and to\nsign-up for daily air quality forecasts and alert notifications by\nemail, text message, phone, or the Minnesota Air mobile app,\nvisit https://www.pca.state.mn.us/air/current-air-quality.\n\nYou can find additional information about health and air quality\nat https://www.pca.state.mn.us/air/why-you-should-care-air-\nquality-and-health.",
				"instruction": "",
				"response": "Monitor",
				"parameters": {
					"PIL": [
						"DLHAQADLH"
					],
					"NWSheadline": [
						"AIR QUALITY ALERT IN EFFECT FROM 6 AM CDT SATURDAY THROUGH 6 AM CDT MONDAY"
					],
					"BLOCKCHANNEL": [
						"EAS",
						"NWEM",
						"CMAS"
					]
				}
			}
		}
	];

class Weather {
	constructor() {
		this.fetchWeatherData();
	}
	async fetchWeatherData() {
		try {
			if (!cache.timestamp || Date.now() - cache.timestamp > WEATHER_DATA_STALE_TIME) {
				this.log(`data stale, refreshing (${new Date().toLocaleString()})`);

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
		} catch(e) {
			console.log(e);
		}
	}
	log(msg: string) {
		console.log(`WEATHER - ${msg}`)
	}
}

const weather = new Weather();

router.get('/', safeAsyncRoute(async (req, res) => {
	res.json(await weather.fetchWeatherData());
}));
