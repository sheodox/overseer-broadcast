require('dotenv').config();
import express, {Request, Response} from 'express';
import {relayRouter, broadcasterRouter} from './routes/relay';
import {requestId} from "./middleware/request-id";
import {errorHandler} from "./middleware/error-handler";
import path from "path";
import {createClient as createRedisClient} from 'redis';
import expressSession from 'express-session';
import {isReqSuperUser} from "./middleware/superuser";
import connectRedis from 'connect-redis';
import {safeAsyncRoute} from "./middleware/safe-async-route";
import serializeJavascript from "serialize-javascript";
import passport from "passport";
import {AppRequest} from "./middleware/integrations";
import {router as authRouter} from './routes/auth';
import {router as adminRouter} from './routes/admin';
import {router as lightsRouter} from './routes/lights';
import {router as weatherRouter} from './routes/weather';
import {getManifest} from "./middleware/manifest";
import {getBroadcasters} from "./config";
import {verifyUserPermissions} from "./middleware/users";

const bodyParser = require('body-parser'),
    app = express(),
    port = 4000,
	bootTime = Date.now(),
	redisClient = createRedisClient({
		host: 'redis'
	});

app.use((req, res, next) => {
	console.log(req.originalUrl);
	next();
})
app.use(requestId);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());

const RedisStore = connectRedis(expressSession),
	sessionStore = new RedisStore({client: redisClient}),
	session = expressSession({
		store: sessionStore,
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false,
			expires: new Date(253402300000000)
		}
	});
app.use(session);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use('/relay', relayRouter);
app.use('/auth', authRouter);
app.use('/broadcaster', broadcasterRouter);
app.use('/lights', lightsRouter);
app.use('/weather', weatherRouter);

app.use(express.static('public'));
app.use('/video', verifyUserPermissions, express.static('video/archives'));
app.use('/thumbnail', verifyUserPermissions, express.static('video/thumbnails'));

//used to refresh headless pages
app.use('/meta', (req, res) => {
	res.json({bootTime})
});

async function entry(req: AppRequest, res: Response) {
	if (!req.user.permitted) {
		res.render('no-permissions', {
			appBootstrap: serializeJavascript({
				user: req.user
			})
		})
		return;
	}
	const manifest = await getManifest(),
		links = isReqSuperUser(req)
			? [{path: '/admin', text: 'Admin', icon: 'user-lock'}]
			: [];

	res.render('index', {
		manifest,
		appBootstrap: serializeJavascript({
			user: req.user,
			links,
			cameras: getBroadcasters().map(({id, name}) => ({id, name}))
		})
	});
}
app.get('/', safeAsyncRoute( async (req, res) => {
	if (req.user) {
		await entry(req, res);
	}
	else {
		const manifest = await getManifest();
		res.render('landing', { manifest });
	}
}));
['archive', 'dashboard', 'settings'].forEach(route => {
    const handleRoute = safeAsyncRoute(async (req, res) => {
		if (req.user) {
			await entry(req, res);
		}
		else {
			res.redirect('/')
		}
	});

	app.get(`/${route}`, handleRoute)
	app.get(`/${route}/*`, handleRoute)
})

app.use('/admin', adminRouter);

app.use(errorHandler(false));

app.listen(port, () => console.log(`Overseer Broadcast listening on port ${port}`));

