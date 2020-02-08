import React from 'react';

function Alerts(props) {
	const alerts = (props.alerts || []).map(alert => {
		return <div className="weather-alert" key={alert.uri}>
			<h3>{alert.title}</h3>
			<AlertDescription description={alert.description} />
		</div>
	});
	return (
		<div id="weather-alerts">
			<button onClick={props.closeAlerts}>Close</button>
			{alerts}
		</div>
	)
}

/**
 * Sometimes we get descriptions without line breaks, we need to guess where they should be.
 * @param props
 * @returns {*}
 * @constructor
 */
function AlertDescription({description}) {
	//if we don't have more than an arbitrarily small amount of newlines, insert them ourselves
	const nlMatch = description.match(/\n/g);
	if (!nlMatch || nlMatch.length < 3) {
		return (
			<p className="alert-description">
				{
					description.split('* ').map((text, index) => {
						//don't want to add additional newlines before the first thing
						if (index === 0) {
							return text;
						}
						return [<br key={`d-${index}-0`}/>, <br key={`d-${index}-1`}/>, `* ${text}`];
					})
				}
			</p>
		)
	}
	return (
		<pre className="alert-description">
			{description}
		</pre>
	)
}

export default Alerts;