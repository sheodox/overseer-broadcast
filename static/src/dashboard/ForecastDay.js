import React from 'react';
import nice from './nice';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ForecastDay(props) {
	const {
		time,
		summary,
		temperatureMax,
		temperatureMin
	} = props.forecast;

	return (
		<div className="forecast-day forecast-box">
			<h2>{props.dayOffset === 0 ? 'Today' : nice.weekday(time)} <small>{nice.dateNumOnly(time)}</small></h2>
			<FontAwesomeIcon size="lg" icon={nice.weatherIcon(props.forecast)} />
			<div className="horizontal">
				<div className="vertical forecast-stats">
					<div>{nice.temp(temperatureMax)}</div>
					<div>{nice.temp(temperatureMin)}</div>
				</div>
				<div className="vertical precipitation-amounts">
					<p className="inline-data">{nice.snowfall(props.forecast)}</p>
					<p className="inline-data">{nice.rain(props.forecast)}</p>
				</div>
			</div>
			<p className="summary">{summary}</p>
		</div>
	)
}

export default ForecastDay;