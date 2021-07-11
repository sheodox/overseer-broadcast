import {Router} from "express";
import {verifySuperUser} from "../middleware/superuser";
import {getManifest} from "../middleware/manifest";
import {safeAsyncRoute} from "../middleware/safe-async-route";
import {validateBodySchema} from "../middleware/validate-body-schema";
import Joi from "joi";
import {nanoid} from "nanoid";
import {generateJWT} from "../middleware/integrations";
import {addBroadcaster, getBroadcasters} from "../config";
import {prisma} from "../db/prisma";

export const router = Router();

router.use(verifySuperUser);

router.get('/', safeAsyncRoute(async(req, res) => {
    const manifest = await getManifest();
    res.render('admin', {
        manifest
    });
}));

const broadcasterSchema = Joi.object({
    name: Joi.string().alphanum().min(2).max(100)
});

router.post('/integration/broadcaster', validateBodySchema(broadcasterSchema), safeAsyncRoute(async (req, res, next) => {
    const broadcasters = getBroadcasters();
    if (broadcasters.some(({name}) => name === req.body.name)) {
        return next({status: 400});
    }
    const broadcaster = {
        name: req.body.name,
        id: nanoid(5),
        scope: 'broadcast',
    },
        jwt = generateJWT(broadcaster);
    addBroadcaster(broadcaster);

    res.json({
        jwt
    })
}));

const genericJwtScopeSchema = Joi.object({
    scope: Joi.string().valid('logs', 'lights')
});

router.post('/integration/generate', validateBodySchema(genericJwtScopeSchema), safeAsyncRoute(async (req, res) => {
    res.json({
        jwt: generateJWT({scope: req.body.scope})
    });
}))

router.get('/users', safeAsyncRoute(async (req, res) => {
    res.json(
        await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                permitted: true,
                createdAt: true,
            }
        })
    )
}));

const userUpdateSchema = Joi.object({
    permitted: Joi.boolean()
});
router.post('/users/:userId', validateBodySchema(userUpdateSchema), safeAsyncRoute(async (req, res) => {
    await prisma.user.update({
        where: {id: req.params.userId},
        data: req.body
    })
}));