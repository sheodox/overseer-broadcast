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
	componentDidMount() {
		this.updateTimesInterval = setInterval(() => {
			const d = new Date();
			this.setState({
				time: d.toLocaleTimeString(),
				date: d.toDateString()
			})
		}, 1000)
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