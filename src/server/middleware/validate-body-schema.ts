import {AppRequest} from "./integrations";
import {Response, NextFunction} from "express";
import Joi from "joi";

export function validateBodySchema(schema: Joi.Schema) {
    return (req: AppRequest, res: Response, next: NextFunction) => {
        const {value, error} = schema.validate(req.body)
        if (error) {
            next({status: 400, error});

            if (process.env.NODE_ENV === 'development') {
                console.log('Validation error', error);
            }
        }
        else {
            req.body = value;
            next();
        }
    }
}

