import {User} from '@prisma/client';
import jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from "express";
import {getBroadcasters, BroadcasterConfig} from "../config";
const {INTEGRATION_SECRET} = process.env;

interface Integration {
    issued: number;
    scope: string;
}

type BroadcasterIntegration = BroadcasterConfig & Integration;

export interface BroadcasterRequest extends Request {
    broadcaster: BroadcasterIntegration
}

export interface AppRequest extends Request {
    user: User;
    requestId: string;
}

function getJWTPayloadFromRequest<IntegrationTokenType extends Integration>(req: Request) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    return jwt.verify(token, INTEGRATION_SECRET) as IntegrationTokenType;
}

export function generateJWT(obj: Omit<Integration, 'issued'>) {
    (obj as Integration).issued = Date.now();
    return jwt.sign(obj, INTEGRATION_SECRET);
}

export function verifyBroadcaster(req: BroadcasterRequest, res: Response, next: NextFunction) {
    try {
        const payload = getJWTPayloadFromRequest<BroadcasterIntegration>(req);

        // just to be sure, verify this broadcaster is properly configured
        if (payload.scope !== 'broadcast' || !getBroadcasters().some(({id}) => id === payload.id)) {
            return next({status: 403});
        }

        req.broadcaster = payload;
        next();
    } catch(error) {
        next({status: 401});
    }
}

export function verifyLightsIntegration(req: Request, res: Response, next: NextFunction) {
    try {
        const payload = getJWTPayloadFromRequest<Integration>(req);

        if (payload.scope !== 'lights') {
            return next({status: 403});
        }

        next();
    } catch(error) {
        next({status: 401});
    }
}
