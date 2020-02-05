import React from 'react';
import nice from './nice';
import ForecastDay from "./ForecastDay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Alerts from "./Alerts";

const WEATHER_REFRESH_INTERVAL = 1000 * 60 * 5;


class Weather extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showAlertDetails: false,
			alerts: []
		};
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

		const {currently, minutely, alerts} = this.state,
			daily = this.state.daily.data.map((day, index) => {
				return <ForecastDay key={`forecast-${day.time}`} forecast={day} dayOffset={index}/>
			}),
			fnToggleAlerts = this.toggleAlertDetails.bind(this),
			alertButtonText = alerts.length > 1 ? `Weather Alerts (${alerts.length})` : 'Weather Alert';

		return (
			<div id="weather">
				<div className="horizontal">
					<div id="weather-current" className="forecast-box">
						<div className="horizontal">
							<div className="vertical">
								<h2>Now</h2>
								<FontAwesomeIcon icon={nice.weatherIcon(currently)} />
							</div>
							<div>
								<p id="current-temp">{nice.temp(currently.temperature)}</p>
								<small>Feels like {nice.temp(currently.apparentTemperature)}</small>
							</div>
						</div>
						<p>{minutely.summary}</p>
					</div>
					{!!alerts.length && <button className="danger" onClick={fnToggleAlerts}>{alertButtonText}</button>}
					{this.state.showAlertDetails && <Alerts alerts={alerts} closeAlerts={fnToggleAlerts} />}
				</div>

				<div id="daily" className="horizontal">
					{daily}
				</div>

				<p>
					<small>Updated {nice.time(currently.time)} </small>
					<a href="https://darksky.net/poweredby/">Powered by Dark Sky</a>
				</p>
			</div>
		)
	}
}

export default Weather;