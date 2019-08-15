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
//called by camera servers whenever there is a new update
router.get('/update', async (req, res) => {
    const ip = req.ip.replace('::ffff:', '');
    console.log(`update from ${ip}`);
    res.send('thanks camera');
    
    awaitingResponse[ip].forEach(res => {
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
    });
    awaitingResponse[ip] = [];
});

broadcasters.forEach(({ip}, index) => {
    router.use(`/broadcaster/${index}/`, async (req, res, next) => {
        awaitingResponse[ip].push(res);
    })
});

module.exports = router;
