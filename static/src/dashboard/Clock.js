import React from 'react';

class Clock extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			time: '',
			date: ''
		}
	}
	componentWillUnmount() {
		clearInterval(this.updateTimesInterval);
	}
	updateTime() {
		const d = new Date();
		this.setState({
			time: d.toLocaleTimeString(),
			date: d.toDateString()
		})
	}
	componentDidMount() {
		this.updateTimesInterval = setInterval(this.updateTime.bind(this), 1000);
		this.updateTime();
	}
	render() {
		return (
			<div id="clock">
				<p id="time">{this.state.time}</p>
				<p id="date">{this.state.date}</p>
			</div>
		);
	}
}

export default Clock;