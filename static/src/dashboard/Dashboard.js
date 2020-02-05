import React from 'react';
import Lights from "./Lights";
import Clock from "./Clock";
import Weather from "./Weather";

export default class Dashboard extends React.Component {
	render () {
		return (
			<div id="dashboard">
				<div>
					<Clock />
					<hr/>
					<Lights />
				</div>
				<Weather />
			</div>
		);
	}
}