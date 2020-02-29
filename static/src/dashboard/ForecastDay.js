import React, {useState} from 'react';
import nice from './nice';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import If from '../If';
import ForecastDetailed from "./ForecastDetailed";

const AUTO_HIDE_DETAILS_TIMEOUT = 60 * 1000;

function ForecastDay(props) {
	const {
		time,
		summary,
		temperatureMax,
		temperatureMin,
	} = props.forecast;

	const [showDetailed, toggleDetailed] = useState(false);
	const [hideDetailedTimeout, setHideDetailedTimeout] = useState(0);

	const forecastAttrs = {};
	if (props.hourly.length) {
		Object.assign(forecastAttrs, {
			role: 'button',
			onClick: () => {
				clearTimeout(hideDetailedTimeout);
				// if we're opening details, we'll want to auto-hide them after a while
				if (!showDetailed) {
					setHideDetailedTimeout(
						setTimeout(() => {
							toggleDetailed(false);
						}, AUTO_HIDE_DETAILS_TIMEOUT)
					)
				}
				toggleDetailed(!showDetailed)
			}
		});
	}

	return (
		<div className="forecast-day forecast-box" {...forecastAttrs}>
			<div className="horizontal">
				<div className="vertical">
					<div className="forecast-day-title-bar horizontal">
						<h2>{props.dayOffset === 0 ? 'Today' : nice.weekday(time)} <small>{nice.dateNumOnly(time)}</small></h2>
						<FontAwesomeIcon size="lg" icon={nice.weatherIcon(props.forecast)} />
					</div>
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
				<If renderWhen={props.hourly.length}>
					<ForecastDetailed hourly={props.hourly} show={showDetailed} />
				</If>
			</div>
		</div>
	)
}

export default ForecastDay;