import React from 'react';
import nice, {dateFromTimestamp} from "./nice";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function ForecastDetailed(props) {
	if (!props.show) {
		return <div className="muted show-forecast-details">
			⇢
		</div>
	}

	return (
		<div className="forecast-detailed horizontal">
			{
				props.hourly
					//don't show too granular of times, it's not useful
					.filter(hour => {
						return dateFromTimestamp(hour.time).getHours() % 2 === 0;
					})
					.map((hour) => {
						return (
							<div className="forecast-detailed-hour vertical" key={hour.time}>
								<p className="inline-data">
									<FontAwesomeIcon icon={nice.weatherIcon(hour)} /> {nice.temp(hour.temperature)}
								</p>
								<p className="inline-data">
									{nice.shortHour(dateFromTimestamp(hour.time))}
								</p>
								<p>
									{hour.summary}
								</p>
							</div>
						)
					})
			}
		</div>
	)
}