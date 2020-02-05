const router = require('express').Router(),
	{v3} = require('node-hue-api'),
	{discovery, api} = v3,
	GroupLightState = v3.lightStates.GroupLightState,
	appName = 'overseer-broadcast',
	deviceName = 'overseer',
	lightStates = {
		on:	new GroupLightState().on(),
		off: new GroupLightState().off()
	},
	cache = require('./cache')('lights');

const LIGHTS_POLL_INTERVAL = 10 * 1000;

class Lights {
	constructor() {
		this.ready = Promise.resolve()
			.then(this.connect.bind(this))
	}

	async connect() {
		const ip = await this.discoverBridge();
		if (!cache.user) {
			cache.user = await this.createUser(ip)
		}

		this.api = await api.createLocal(ip).connect(cache.user.username);

		await this.getGroups();

		setTimeout(() => {
			this.getGroups()
		}, LIGHTS_POLL_INTERVAL)

	}

	async getGroups() {
		const isFirstCall = !this.groups,
			groups = await this.api.groups.getAll();
		//ignore the 0th light group, it's a special one we don't care about (all groups)
		groups.shift();

		//log info about the groups, if the IDs are wanted for external scripts reusing this functionality
		if (isFirstCall) {
			for (const group of groups) {
				console.log(group.toStringDetailed());
			}
		}

		this.groups = groups.map(group => ({
			id: group.id,
			name: group.name,
			on: group.state.all_on,
			brightness: group.action.bri
		}))
	}

	async toggle(id) {
		id = parseInt(id, 10);
		const group = this.groups.find(group => id === group.id);
		if (!group) {
			return {
				error: `No light group with id "${id}" exists.`
			}
		}
		const nextState = group.on ? lightStates.off : lightStates.on;
		group.on = !group.on;

		await this.api.groups.setGroupState(id, nextState);
		return {};
	}

	async discoverBridge() {
		const [bridge] = await discovery.nupnpSearch();

		if (bridge) {
			return bridge.ipaddress;
		} else {
			console.error('Failed to resolve any Hue Bridges');
			return null;
		}
	}

	async createUser(ipAddress) {
		// Create an unauthenticated instance of the Hue API so that we can create a new user
		const unauthenticatedApi = await api.createLocal(ipAddress).connect();

		try {
			return await unauthenticatedApi.users.createUser(appName, deviceName);
		} catch (err) {
			if (err.getHueErrorType() === 101) {
				throw new Error('The Link button on the bridge was not pressed. Please press the Link button and try again.');
			} else {
				throw err;
			}
		}
	}
}
const lights = new Lights();

router.use('/lights', (req, res, next) => {
	lights.ready.then(next);
});

router.get('/lights/info', (req, res) => {
	res.json(lights.groups);
});

router.get('/lights/toggle/:id', async (req, res) => {
	const {error} = await lights.toggle(req.params.id);
	if (error) {
		res.status(400);
		res.json({error})
	}
	else {
		res.json(lights.groups);
	}
});

router.post('/lights/toggle-several', async (req, res) => {
	if (!req.body || !Array.isArray(req.body.groups)) {
		res.status(400);
		res.json({
			error: 'You must provide an array of group IDs to toggle those light groups!'
		})
	}
	else {
		for (const id of req.body.groups) {
			await lights.toggle(id);
			res.json(lights.groups);
		}
	}
});


module.exports = router;
