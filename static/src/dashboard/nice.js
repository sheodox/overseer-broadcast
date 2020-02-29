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

export const dateFromTimestamp = timestamp => {
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

const formatters = {
	date: formatDateAs('toDateString'),
	dateNumOnly: (timestamp) => {
		const d = dateFromTimestamp(timestamp);
		return `${d.getMonth() + 1}/${d.getDate()}`
	},
	weekday: (timestamp) => {
		return formatDateAs('toDateString')(timestamp).replace(/ .*/, '');
	},
	time: formatDateAs('toLocaleTimeString'),
	//hh:mm without AM/PM, but in 12 hour time
	superShortTime: date => {
		const hours = date.getHours(),
			displayHours = hours > 12 ? hours - 12 : hours,
			displayMinutes = date.getMinutes().toString().padStart(2, '0');
		return `${displayHours === 0 ? '12' : displayHours}:${displayMinutes}`;
	},
	//hh:mm p
	shortTime: date => {
		const hours = date.getHours();
		const amPm = hours > 11 || hours === 0 ? 'PM' : 'AM';
		return `${formatters.superShortTime(date)} ${amPm}`
	},
	shortHour: date => {
		const hours = date.getHours(),
			displayHours = hours > 12 ? hours - 12 : hours,
			amPm = hours > 11 || hours === 0 ? 'PM' : 'AM';
		return `${displayHours === 0 ? '12' : displayHours} ${amPm}`;
	},
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
export default formatters;
