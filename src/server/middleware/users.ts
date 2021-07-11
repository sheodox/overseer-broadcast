import {NextFunction, Response} from "express";
import {AppRequest} from "./integrations";
import {safeAsyncRoute} from "./safe-async-route";

export const verifyUserPermissions = safeAsyncRoute(async (req, res, next) => {
    if (!req.user) {
        next({status: 401});
    }
    else if (!req.user.permitted) {
        next({status: 403});
    }
    else {
        next();
    }
});

export function requireAuth(req: AppRequest, res: Response, next: NextFunction) {
    req.user ? next() : next({status: 401});
}
