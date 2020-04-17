import React from 'react';
import nice, {dateFromTimestamp} from './nice';
import ForecastDay from "./ForecastDay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Alerts from "./Alerts";
import WeatherGraph from "./WeatherGraph";
import WeatherTempDebug from "./WeatherTempDebug";

const WEATHER_REFRESH_INTERVAL = 1000 * 60 * 5;


class Weather extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showAlertDetails: false,
			alerts: []
		};
		//show all temperatures to inspect colors
		this.tempDebug = false;
	}
	async componentDidMount() {
		this.update();
		this.updateInterval = setInterval(() => {
			this.update();
		}, WEATHER_REFRESH_INTERVAL)
	}
	async update() {
		const data = await fetch('weather')
			.then(res => res.json());

		//if we no longer have alerts, we don't want old alerts hanging around
		if (!data.alerts) {
			data.alerts = [];
		}

		this.setState(data);
		console.log(data);
	}
	componentDidUpdate(prevProps, prevState) {
		//don't want to show empty alerts if they're left open but expire
		if (this.state.alerts.length === 0 && prevState.alerts.length !== this.state.alerts.length) {
			this.setState({
				showAlertDetails: false
			})
		}
	}
	componentWillUnmount() {
		clearTimeout(this.updateInterval);
	}
	toggleAlertDetails() {
		this.setState({
			showAlertDetails: !this.state.showAlertDetails
		});
	}

	render() {
		if (!this.state.currently) {
			return null;
		}

		if (this.tempDebug) {
			return (
				<div id="weather">
					<WeatherTempDebug/>
				</div>
			);
		}

		const {currently, minutely, alerts} = this.state;

		//screensaver
		if (this.props.mode === 'minimal') {
			return (
				<div id="weather-minimal">
					<p id="minimal-temp">
						<FontAwesomeIcon icon={nice.weatherIcon(currently)} />
						{nice.temp(currently.temperature)}
					</p>
					<p>{currently.summary}</p>
					{!!alerts.length && <p className="danger">
						{alerts.length > 1 ? `${alerts.length} weather alerts` : alerts[0].title}
					</p>}
				</div>
			);
		}

		const daily = this.state.daily.data.map((day, index) => {
				const thisDayHourly = this.state.hourly.data.filter((hour) => {
					const hourDate = dateFromTimestamp(hour.time),
						dayDate = dateFromTimestamp(day.time);
					return ['getDate', 'getMonth', 'getYear'].every(op => {
						return hourDate[op]() === dayDate[op]();
					})
				});
				return <ForecastDay key={`forecast-${day.time}`} forecast={day} hourly={thisDayHourly} dayOffset={index}/>
			}),
			fnToggleAlerts = this.toggleAlertDetails.bind(this),
			alertButtonText = alerts.length > 1 ? `Weather Alerts (${alerts.length})` : 'Weather Alert';

		return (
			<div id="weather">
				<div id="weather-current-container" className="horizontal">
					<div className="vertical">
						<div id="weather-current" className="forecast-box">
							<div className="horizontal">
								<div className="vertical">
									<h2>Now</h2>
									<FontAwesomeIcon icon={nice.weatherIcon(currently)} />
								</div>
								<div>
									<p id="current-temp">{nice.temp(currently.temperature)}</p>
									<small className="nowrap">Feels like</small> <small className="nowrap">{nice.temp(currently.apparentTemperature)}</small>
								</div>
							</div>
							<p>{minutely.summary}</p>
						</div>
						{!!alerts.length && <button className="danger" onClick={fnToggleAlerts}>{alertButtonText}</button>}
						{this.state.showAlertDetails && <Alerts alerts={alerts} closeAlerts={fnToggleAlerts} />}
					</div>

					<WeatherGraph weather={this.state} />
				</div>

				<div id="daily" className="horizontal">
					{daily}
				</div>

				<p>
					<small>Updated {nice.time(currently.time)} <a href="https://darksky.net/poweredby/">Powered by Dark Sky</a></small>
				</p>
			</div>
		)
	}
}

export default Weather;