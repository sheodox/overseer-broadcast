import {AppRequest} from "./integrations";
import {NextFunction, Response} from "express";
import {nanoid} from "nanoid";

export const requestId = (req: AppRequest, res: Response, next: NextFunction) => {
    req.requestId = nanoid();
    next();
}