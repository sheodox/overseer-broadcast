const router = require('express').Router({strict: true}),
    request = require('request'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    readdir = util.promisify(fs.readdir),
    stat = util.promisify(fs.stat),
    archiver = require('./archiver'),
    config = require('./config'),
    broadcasters = config.getBroadcasters();

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
router.get('/archive/:file', (req, res) => {
    fs
        .createReadStream(`./video/archives/${req.params.file}.mp4`)
        .pipe(res);
});
router.get('/thumbnail/:file', (req, res) => {
    fs
        .createReadStream(`./video/thumbnails/${req.params.file}.png`)
        .pipe(res);
});


function sendStreamSegment(res, ip) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    const url = `http://${ip}/stream_dashinit.mp4`,
        r = request
            .get(url)
            .on('error', function() {
                console.log(`error connecting to ${url}`);
                res.status(500);
                res.send('remote host not reachable');
            });
    r.pipe(res);
}
//called by camera servers whenever there is a new update
router.get('/update', async (req, res) => {
    const ip = req.ip.replace('::ffff:', '');
    console.log(`update from ${ip}`);
    res.send('thanks camera');
    archiver[ip].nextSegment();
    
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
