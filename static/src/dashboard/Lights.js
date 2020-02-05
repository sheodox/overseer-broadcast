import React from 'react';

class Lights extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			groups: []
		};
	}

	componentDidMount() {
		this.update();
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
			<div id="lights">
				<h2>Lights</h2>
				<ul>
					{lights}
				</ul>
			</div>
		)
	}
}

function Light(props) {
	return (
		<li>
			<button onClick={props.toggle} className={'lights-button ' + (props.on ? 'on' : 'off')}>{props.name}</button>
		</li>
	)
}

export default Lights;
