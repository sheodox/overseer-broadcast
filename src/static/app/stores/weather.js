import {writable, derived} from "svelte/store";
const WEATHER_UPDATE_INTERVAL = 5 * 60 * 1000;

export const alerts = writable([]);
export const weather = writable([], set => {
    function update() {
        fetch('/weather')
            .then(res => res.json())
            .then(weatherData => {
                set(weatherData.weather);
                alerts.set(weatherData.alerts)
            })
    }

    update();
    const updateInterval = setInterval(update, WEATHER_UPDATE_INTERVAL);
    return () => clearInterval(updateInterval);
});

export const currentWeather = derived(weather, weather => {
    const currentInterval = weather.find(({timestep}) => timestep === 'current');

    return currentInterval?.intervals[0].values;
});

export const hourlyWeather = derived(weather, weather => {
    return weather?.find(({timestep}) => timestep === '1h')?.intervals || [];
});

export const dailyWeather = derived(weather, weather => {
    return weather?.find(({timestep}) => timestep === '1d')?.intervals || [];
})

export function getDayName(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    if (date.toLocaleDateString() === new Date().toLocaleDateString()) {
        return 'Today';
    }
    else {
        return [
            'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
        ][date.getDay()]
    }
}

const weatherCodeMap = new Map([
    [ 0, {description: "Unknown", icon: 'question-circle' }],
    [ 1000, {description: "Clear", icon: 'sun'}],
    [ 1001, {description: "Cloudy", icon: 'cloud'}],
    [ 1100, {description: "Mostly Clear", icon: 'cloud-sun'}],
    [ 1101, {description: "Partly Cloudy", icon: 'cloud-sun'}],
    [ 1102, {description: "Mostly Cloudy", icon: 'cloud-sun'}],
    [ 2000, {description: "Fog", icon: 'smog'}],
    [ 2100, {description: "Light Fog", icon: 'smog'}],
    [ 3000, {description: "Light Wind", icon: 'wind'}],
    [ 3001, {description: "Wind", icon: 'wind'}],
    [ 3002, {description: "Strong Wind", icon: 'wind'}],
    [ 4000, {description: "Drizzle", icon: 'cloud-rain'}],
    [ 4001, {description: "Rain", icon: 'cloud-rain'}],
    [ 4200, {description: "Light Rain", icon: 'cloud-rain'}],
    [ 4201, {description: "Heavy Rain", icon: 'cloud-showers-heavy'}],
    [ 5000, {description: "Snow", icon: 'snowflake'}],
    [ 5001, {description: "Flurries", icon: 'snowflake'}],
    [ 5100, {description: "Light Snow", icon: 'snowflake'}],
    [ 5101, {description: "Heavy Snow", icon: 'snowflake'}],
    [ 6000, {description: "Freezing Drizzle", icon: 'icicles'}],
    [ 6001, {description: "Freezing Rain", icon: 'icicles'}],
    [ 6200, {description: "Light Freezing Rain", icon: 'icicles'}],
    [ 6201, {description: "Heavy Freezing Rain", icon: 'icicles'}],
    [ 7000, {description: "Ice Pellets", icon: 'icicles'}],
    [ 7101, {description: "Heavy Ice Pellets", icon: 'icicles'}],
    [ 7102, {description: "Light Ice Pellets", icon: 'icicles'}],
    [ 8000, {description: "Thunderstorm", icon: 'bolt'}]
]);

export const weatherCodeToIcon = (code=0) => {
    return weatherCodeMap.get(code).icon;
}

export const weatherCodeToDescription = (code=0) => {
    return weatherCodeMap.get(code).description;
}

export function getColorClass(temp) {
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
