import React from 'react';
import {
	faCloud,
	faCloudMoon,
	faCloudRain,
	faCloudSun, faMoon, faSmog,
	faSnowflake,
	faSun,
	faWind
} from "@fortawesome/free-solid-svg-icons";

const dateFromTimestamp = timestamp => {
	const d = new Date();
	d.setTime(timestamp * 1000);
	return d;
};
const formatDateAs = formatter => timestamp => {
	return dateFromTimestamp(timestamp)[formatter]();
};

function getColorClass(temp) {
	const biggestTen = Math.floor(temp / 10) * 10;
	if (biggestTen < -30) {
		return 'temp-bottom';
	}
	else if (biggestTen > 100) {
		return 'temp100'
	}
	else {
		return `temp${biggestTen}`
	}
}


//really small amounts of snow really don't matter so ignore them;
const SNOW_DISPLAY_THRESHOLD = 0.4;

export default {
	date: formatDateAs('toDateString'),
	dateNumOnly: (timestamp) => {
		const d = dateFromTimestamp(timestamp);
		return `${d.getMonth() + 1}/${d.getDate()}`
	},
	weekday: (timestamp) => {
		return formatDateAs('toDateString')(timestamp).replace(/ .*/, '');
	},
	time: formatDateAs('toLocaleTimeString'),
	temp: num => {
		return <span className={'temp ' + getColorClass(num)}>{Math.round(num)}°F</span>
	},
	rain: weatherData => {
		const probability = (100 * weatherData.precipProbability).toFixed(0);
		return `${probability}%`;
	},
	weatherIcon: weatherData => {
		switch(weatherData.icon) {
			case 'clear-day':
				return faSun;
			case 'clear-night':
				return faMoon;
			case 'rain':
				return faCloudRain;
			case 'snow':
				return faSnowflake;
			case 'sleet':
				return faSnowflake;
			case 'wind':
				return faWind;
			case 'fog':
				return faSmog;
			case 'cloudy':
				return faCloud;
			case 'partly-cloudy-day':
				return faCloudSun;
			case 'partly-cloudy-night':
				return faCloudMoon;
			default:
				console.error(`missing icon for weather type: "${weatherData.icon}"`);
				return null;
		}
	},
	snowfall: weatherData => {
		const amount = weatherData.precipAccumulation,
			type = weatherData.precipType;

		if (amount && amount > SNOW_DISPLAY_THRESHOLD) {
			return `${amount}" ${type}`
		}
	}
};
