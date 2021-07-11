import {Response, Router} from 'express';
import fs from 'fs/promises';
import path from 'path';
import bodyParser from 'body-parser';
import {BroadcasterRequest, verifyBroadcaster} from "../middleware/integrations";
import {verifyUserPermissions} from "../middleware/users";
import {safeAsyncRoute} from "../middleware/safe-async-route";
import {BroadcasterConfig, getBroadcasters} from "../config";
import {relayLogger} from "../logger";

export const relayRouter = Router();
export const broadcasterRouter = Router();

const archiver = require('../archiver'),
    broadcasters = getBroadcasters(),
    //don't send clips that are too old
    CLIP_TTL = 30 * 1000,
    currentClips: Record<string, {time: number, clip: any}> = {};

//keys on this object are broadcaster IDs, each holding an array of express
//response objects waiting for an update from a camera at that ID
let awaitingResponse: Record<string, Response[]> = {};
for (let i = 0; i < broadcasters.length; i++) {
    awaitingResponse[broadcasters[i].id] = [];
}

relayRouter.use(verifyUserPermissions);
relayRouter.get('/broadcasts', (req, res) => {
    res.json(
        broadcasters.map((b, index: number) => {
            return {name: b.name, stream: index}
        })
    );
});

relayRouter.get('/archives', safeAsyncRoute(async (req, res) => {
    const archiveDir = './video/archives',
        files = await fs.readdir(archiveDir),
        list = [];
    let totalSize = 0;
    for (let i = 0; i < files.length; i++) {
        const size = (await fs.stat(path.join(archiveDir, files[i]))).size;
        totalSize += size;
        const fileName = files[i].replace(/\.mp4$/, ''),
            [camera, date] = fileName.split('-');

        list.push({
            file: fileName,
            camera, size,
            date: parseInt(date, 10)
        });
    }
    
    res.json({
        list,
        size: totalSize
    })
}));

function sendStreamSegment(res: Response, id: string) {
    const {clip, time} = (currentClips[id] || {});
    if (!clip || Date.now() - time > CLIP_TTL) {
        //it's either too early and we don't have a clip yet
        //or the most recent clip we have is from a while ago. don't want to send a stale clip
        res.status(404)
        return res.send()
    }
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');

    res.header('Content-Type', 'video/mp4');
    return res.send(clip);
}

relayRouter.use(`/stream/:broadcasterId/segment/:segmentNumber`, safeAsyncRoute(async (req, res, next) => {
    const id = req.params.broadcasterId;
    //send the first segment immediately so it doesn't just load for ten seconds
    if (parseInt(req.params.segmentNumber) === 0) {
        await sendStreamSegment(res, id);
    }
    else {
        awaitingResponse[id].push(res);
    }
}));

broadcasterRouter.use(verifyBroadcaster);
// Used by the install script to verify that the device is a known broadcaster.
broadcasterRouter.get('/verify', (req: BroadcasterRequest, res) => {
    res.send('');
})
broadcasterRouter.use(bodyParser.raw({
    type: 'video/mp4',
    limit: '10mb'
}))
//called by camera servers whenever there is a new update
broadcasterRouter.post('/update', async (req: BroadcasterRequest, res, next) => {
    try {
        const {id} = req.broadcaster;
        relayLogger.debug(`update from ${req.broadcaster.name} (${id})`);
        res.send('thanks camera');

        currentClips[id] = {
            time: Date.now(),
            clip: req.body
        };

        //if we've got an update for a valid camera, but it was added after the server booted,
        //make sure we actually have a holding place for responses for this camera
        if (!awaitingResponse[id]) {
            awaitingResponse[id] = [];
        }

        awaitingResponse[id].forEach(res => {
            sendStreamSegment(res, id);
        });
        awaitingResponse[id] = [];

        await archiver[id].nextSegment(req.body);
    }
    catch(e) {
        next(e)
    }
});
