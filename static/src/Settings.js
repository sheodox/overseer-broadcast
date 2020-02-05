import React from 'react';
import lsCache from './lsCache';
const settings = lsCache('settings');

function Settings(props) {
	function save(e) {
		settings.touchpadMode = touchpadRef.current.checked;
		reload();
	}
	function reload() {
		location.reload();
	}
	const touchpadRef = React.createRef();

	return (
		<div id="settings">
			<h2>Settings</h2>

			<form onSubmit={save}>
				<p>Touchpad mode is intended for wall mounted always-on displays. It includes some features</p>
				<input type="checkbox" id="touchpad-mode" defaultChecked={settings.touchpadMode} ref={touchpadRef} />
				<label htmlFor="touchpad-mode">Touchpad Mode</label>

				<br/>
				<button>Save</button>
			</form>
			<br/>
			<button onClick={reload}>Reload</button>
			<p className="muted">
				Icons provided by Font Awesome. Weather data is by Dark Sky.
			</p>
		</div>
	);
}

export default Settings;