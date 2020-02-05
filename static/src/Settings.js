import React from 'react';
import lsCache from './lsCache';
const settings = lsCache('settings');

function Settings(props) {
	function save(e) {
		settings.touchpadMode = touchpadRef.current.checked;
		location.reload();
	}
	const touchpadRef = React.createRef();
	console.log('checked', settings.touchpadMode);
	return (
		<div id="settings">
			<h2>Settings</h2>

			<form onSubmit={save}>
				<input type="checkbox" id="touchpad-mode" defaultChecked={settings.touchpadMode} ref={touchpadRef} />
				<label htmlFor="touchpad-mode">Touchpad Mode</label>
				<p>Touchpad mode is intended for wall mounted always-on displays. It includes some features</p>

				<button>Save</button>

				<p>

				</p>
			</form>
			<p>
				Icons provided by Font Awesome. Weather data is by Dark Sky.
			</p>
		</div>
	);
}

export default Settings;