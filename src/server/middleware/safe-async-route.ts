import {AppRequest} from "./integrations";
import {Response, NextFunction} from "express";

export type AppRouteHandler = (req: AppRequest, res: Response, next?: NextFunction) => Promise<any>;

//Express doesn't catch errors in async functions, wrap them all in this so
//throwing in an handler will respond with a 500 error if it throws
export const safeAsyncRoute = (routeHandler: AppRouteHandler) => {
    return async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            await routeHandler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};
