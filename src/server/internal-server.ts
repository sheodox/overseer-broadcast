/*
This file runs on a port that's not exposed outside of the firewall.

This can be used to expose things like metrics to prometheus.
 */
import express from 'express';
import {requestId} from "./middleware/request-id";
import {AppRequest, verifyLoggingIntegration} from "./middleware/integrations";
import {remoteTransport} from "./logger";
import {errorHandler} from "./middleware/error-handler";

const app = express();
app.use(requestId);

app.get('/logs', verifyLoggingIntegration, (req: AppRequest, res, next) => {
    res.json(remoteTransport.flushBuffer());
});

app.use((req, res, next) => {
    next({status: 404});
})
app.use(errorHandler(true));

app.listen(4001);
