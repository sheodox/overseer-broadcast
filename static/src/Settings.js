import React, {useState, useEffect} from 'react';
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
	function toggleFullscreen() {
		document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
	}

	const [bootTime, setBootTime] = useState(null);
	const touchpadRef = React.createRef();

	useEffect(() => {
		const getMeta = async () => {
			const meta = await fetch('meta').then(res => res.json()),
				d = new Date();
			d.setTime(meta.bootTime);
			setBootTime(d.toLocaleString());
		};
		getMeta();
	});

	return (
		<div id="settings">
			<h2>Settings</h2>

			<form onSubmit={save}>
				<p>Touchpad mode is intended for wall mounted always-on displays. It includes some features like a screen saver during periods of inactivity, disabling archive downloading, and hidden cursors.</p>
				<input type="checkbox" id="touchpad-mode" defaultChecked={settings.touchpadMode} ref={touchpadRef} />
				<label htmlFor="touchpad-mode">Touchpad Mode</label>

				<br/>
				<button>Save</button>
			</form>

			<div id="extra-button-group">
				<button onClick={reload}>Reload</button>
				<button onClick={toggleFullscreen}>Toggle Fullscreen</button>
			</div>

			<p className="muted">
				Icons provided by Font Awesome. Weather data is by Dark Sky. {bootTime && `Server started ${bootTime}.`}
			</p>
		</div>
	);
}

export default Settings;