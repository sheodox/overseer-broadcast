import {User} from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {Router} from "express";
import {prisma} from "../db/prisma";
import {findUserNoSensitiveData} from "../db/users";
import Joi from "joi";
import {validateBodySchema} from "../middleware/validate-body-schema";
import {requireAuth} from "../middleware/users";
import {safeAsyncRoute} from "../middleware/safe-async-route";
import {authLogger} from "../logger";

export const router = Router();

passport.use(new LocalStrategy(
    {usernameField: 'email', passwordField: 'password'},
    async (email, password, done) => {
        try {
            const user = await prisma.user.findUnique({where: {email}}),
                passwordCorrect = user && await bcrypt.compare(password, user.passwordHash);

            if (passwordCorrect) {
                authLogger.info(`User logged in ${user.id}`);
                const safeUser = await findUserNoSensitiveData({id: user.id});
                done(null, safeUser);
            } else {
                done(null, false, {message: 'Incorrect email or password.'});
            }
        }
        catch(e) {
            done(e, false);
        }
    }
));

passport.serializeUser((user: User, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await findUserNoSensitiveData({id})

        user ? done(null, user) : done(new Error('No User Found'), false);
    }
    catch(e) {
        done(e, false);
    }
});

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    });

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

async function hashPassword(password: string) {
    return await bcrypt.hash(password, 12)
}

const userFields = {
        email: Joi.string().email(),
        password: Joi.string().min(8).max(100),
        firstName: Joi.string().max(100),
        lastName: Joi.string().max(100)
    },
    signupSchema = Joi.object({
        email: userFields.email.required(),
        password: userFields.password.required(),
        firstName: userFields.firstName.required(),
        lastName: userFields.lastName.required()
    }).unknown(false),
    userProfileSchema = Joi.object({
        ...userFields
    }).unknown(false),
    userPasswordSchema = Joi.object({
        password: userFields.password.required(),
        newPassword: userFields.password.required()
    }).unknown(false);

router.post('/signup', validateBodySchema(signupSchema), safeAsyncRoute(async (req, res, next) => {
    const userWithSameEmail = await prisma.user.findUnique({ where: {
            email: req.body.email
        }
    });

    if (userWithSameEmail) {
        return next({status: 400});
    }

    const passwordHash = await hashPassword(req.body.password),
        user = await prisma.user.create({
            data: {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                passwordHash
            }
        });
    authLogger.info(`New user signed up ${user.id}`);

    const safeUser = await findUserNoSensitiveData({id: user.id})

    req.login(safeUser, error => {
        if (error) {
            authLogger.error(`Error logging user in ${user.id}`, {error});
            next({status: 500})
        }
        else {
            res.send();
        }
    })
}));

router.post('/profile', requireAuth, validateBodySchema(userProfileSchema), safeAsyncRoute(async(req, res, next) => {
    const userWithThatEmail = await prisma.user.findUnique({where: {email: req.body.email}});

    // ensure the email isn't taken by someone else, this *could* lead to a TOCTOU error,
    // but with the unique constraint in the email column it'd just be a 500 error instead of 400
    // so nothing bad would happen except the wrong status code
    if (userWithThatEmail && userWithThatEmail.id !== req.user.id) {
        return next({status: 400});
    }

    await prisma.user.update({
        where: {id: req.user.id},
        data: req.body
    })
    res.send();
}));

router.post('/change-password', requireAuth, validateBodySchema(userPasswordSchema), safeAsyncRoute(async(req, res, next) => {
    const user = await prisma.user.findUnique({where: {id: req.user.id}}),
        passwordCorrect = user && await bcrypt.compare(req.body.password, user.passwordHash);

    // ensure they entered the correct old password, or they won't have permission to change it
    if (passwordCorrect) {
        const passwordHash = await hashPassword(req.body.newPassword);
        await prisma.user.update({
            where: {id: req.user.id},
            data: { passwordHash }
        });
        res.send();
    }
    else {
        next({status: 400})
    }
}));
