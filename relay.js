const router = require('express').Router({strict: true}),
    request = require('request'),
    broadcasters = require('./config.json').broadcasters || [];

//an array (indices are 
// ) of arrays of requests
let awaitingResponse = {};
for (let i = 0; i < broadcasters.length; i++) {
    awaitingResponse[broadcasters[i].ip] = ([]);
}

router.get('/', async (req, res) => {
    res.render('index', {title: 'Overseer Broadcast', streams: broadcasters.map((broadcaster, index) => index)})
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
