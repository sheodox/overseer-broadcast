const router = require('express').Router({strict: true}),
    request = require('request'),
    bodyParser = require('body-parser'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    readdir = util.promisify(fs.readdir),
    stat = util.promisify(fs.stat),
    archiver = require('./archiver'),
    config = require('./config'),
    broadcasters = config.getBroadcasters(),
    //don't send clips that are too old
    CLIP_TTL = 30 * 1000,
    currentClips = {};

//keys on this object are broadcaster IPs, each holding an array of express
//response objects waiting for an update from a camera at that IP
let awaitingResponse = {};
for (let i = 0; i < broadcasters.length; i++) {
    awaitingResponse[broadcasters[i].ip] = ([]);
}

async function entry(req, res) {
    res.render('index', {title: 'Overseer Broadcast'})
}
router.get('/', entry);

router.get('/info/broadcasts', (req, res) => {
    res.json(
        broadcasters.map((b, index) => {return {name: b.name, stream: index}})
    );
});

router.get('/info/archives', async (req, res) => {
    const archiveDir = './video/archives',
        files = await readdir(archiveDir),
        list = [];
    let size = 0;
    for (let i = 0; i < files.length; i++) {
        const s = (await stat(path.join(archiveDir, files[i]))).size;
        size += s;
        list.push({
            file: files[i].replace(/\.mp4$/, ''),
            size: s
        });
    }
    
    res.json({list, size})
});

function sendStreamSegment(res, ip) {
    const {clip, time} = (currentClips[ip] || {});
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
    res.send(clip);
}
router.use(bodyParser.raw({
    type: 'video/mp4'
}))
//called by camera servers whenever there is a new update
router.post('/update', async (req, res) => {
    const ip = req.ip.replace('::ffff:', '');
    console.log(`update from ${ip}`);
    res.send('thanks camera');

    currentClips[ip] = {
        time: Date.now(),
        clip: req.body
    };
    archiver[ip].nextSegment(req.body);
    
    awaitingResponse[ip].forEach(res => {
        sendStreamSegment(res, ip);
    });
    awaitingResponse[ip] = [];
});

router.use(`/broadcaster/:broadcaster/stream/segment/:segmentNumber`, async (req, res, next) => {
    const {ip} = broadcasters[parseInt(req.params.broadcaster)];
    //send the first segment immediately so it doesn't just load for ten seconds
    if (parseInt(req.params.segmentNumber) === 0) {
        sendStreamSegment(res, ip);
    }
    else {
        awaitingResponse[ip].push(res);
    }
});

module.exports = router;
