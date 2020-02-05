import React from 'react';
const LIGHTS_POLL_INTERVAL = 10 * 1000;

class Lights extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			groups: []
		};
	}

	componentDidMount() {
		this.update();
		this.lightsPollInterval = setInterval(() => {
			this.update();
		}, LIGHTS_POLL_INTERVAL)
	}

	componentWillUnmount() {
		clearInterval(this.lightsPollInterval);
	}

	async update() {
		this.call('info');
	}

	async call(lightsEndpoint) {
		const groups = await fetch(`lights/${lightsEndpoint}`)
			.then(res => res.json());
		this.setState({
			groups
		});
	}


	render() {
		const lights = this.state.groups.map(group => {
			return <Light {...group} key={group.id} toggle={this.call.bind(this, `toggle/${group.id}`)}/>
		});

		return (
			<div id="lights" className="vertical">
				<h2>Lights</h2>
				{lights}
			</div>
		)
	}
}

function Light(props) {
	return (
		<button onClick={props.toggle} className={'lights-button ' + (props.on ? 'on' : 'off')}>{props.name}</button>
	)
}

export default Lights;
