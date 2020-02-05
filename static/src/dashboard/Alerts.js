import React from 'react';

function Alerts(props) {
	const alerts = (props.alerts || []).map(alert => {
		return <div className="weather-alert" key={alert.uri}>
			<h3>{alert.title}</h3>
			<pre>
				{alert.description}
			</pre>
		</div>
	});
	return (
		<div id="weather-alerts">
			<button onClick={props.closeAlerts}>Close</button>
			{alerts}
		</div>
	)
}

export default Alerts;