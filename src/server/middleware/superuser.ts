import {AppRequest} from "./integrations";
import {NextFunction, Response} from "express";

export function isReqSuperUser(req: AppRequest) {
    const superUserId = process.env.SUPER_USER_ID;
    return superUserId && req.user.id === superUserId
}

export function verifySuperUser(req: AppRequest, res: Response, next: NextFunction) {
    if (isReqSuperUser(req)) {
        next();
    }
    else {
        next({status: 403});
    }
}