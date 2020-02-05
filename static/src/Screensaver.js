import React from 'react';
import Clock from "./dashboard/Clock";
import Weather from "./dashboard/Weather";

class Screensaver extends React.Component {
	componentDidMount() {
		document.documentElement.classList.add('noscroll');
	}
	componentWillUnmount() {
		document.documentElement.classList.remove('noscroll');
	}
	render() {

		return (
			<div id="screensaver" className="horizontal">
				<div id="screensaver-info" className="vertical">
					<Clock/>
					<Weather mode="minimal"/>
					<p>Tap the screen</p>
				</div>
			</div>
		)
	}
}

export default Screensaver;