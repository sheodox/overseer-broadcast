import {Router} from 'express';
import {v3} from 'node-hue-api';
import {verifyLightsIntegration} from "../middleware/integrations";
import Api from "node-hue-api/lib/api/Api";
import {safeAsyncRoute} from "../middleware/safe-async-route";
import {validateBodySchema} from "../middleware/validate-body-schema";
import Joi from "joi";
import {verifyUserPermissions} from "../middleware/users";
import {lightsLogger} from "../logger";

export const router = Router();
const {discovery, api} = v3,
	GroupLightState = v3.lightStates.GroupLightState,
	appName = 'overseer-broadcast',
	deviceName = 'overseer',
	lightStates = {
		on:	new GroupLightState().on(true),
		off: new GroupLightState().off()
	},
	cache = require('../cache')('lights');

router.use(verifyUserPermissions);

const LIGHTS_POLL_INTERVAL = 10 * 1000;

interface LightUpdatable {
	on?: boolean;
	brightness?: number;
}

class Lights {
	public ready: Promise<void>;
	private api: Api;
	public groups: {id: number | string, name: string, brightness: number, on: boolean}[];
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

		setInterval(() => {
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
				lightsLogger.info(group.toStringDetailed());
			}
		}

		this.groups = groups.map(group => ({
			id: group.id,
			name: group.name,
			on: group.state.all_on,
			brightness: group.action.bri
		}))
	}

	async update(id: number, updates: LightUpdatable) {
		const group = this.groups.find(group => id === group.id);
		if (!group) {
			return {error: `No light group with id "${id}" exists.`};
		}

		const state = new GroupLightState();
		if ('on' in updates) {
			state.on(updates.on);
			group.on = updates.on;
		}
		if ('brightness' in updates) {
			// brightness expects a percentage
			state.brightness(100 * (updates.brightness / 254));
			group.brightness = updates.brightness;
		}

		this.api.groups.setGroupState(id, state)
		return {}
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

	async createUser(ipAddress: string) {
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

router.use('/', (req, res, next) => {
	lights.ready.then(next);
});

router.get('/state', (req, res) => {
	res.json(lights.groups);
});


const lightUpdateSchema = Joi.object({
	on: Joi.boolean(),
	brightness: Joi.number().min(0).max(254).integer()
});

router.post('/:id/', validateBodySchema(lightUpdateSchema), safeAsyncRoute(async (req, res, next) => {
	const {error} = await lights.update(
		parseInt(req.params.id, 10),
		req.body
	);
	if (error) {
		next({status: 400});
	}
	res.json(lights.groups);
}));

const lightsSeveralSchema = Joi.object({
	groups: Joi.array().items(Joi.number())
});

router.post('/toggle-several', verifyLightsIntegration, validateBodySchema(lightsSeveralSchema), safeAsyncRoute(async (req, res) => {
	for (const id of req.body.groups) {
		// await lights.toggle(id);
		res.json(lights.groups);
	}
}));
