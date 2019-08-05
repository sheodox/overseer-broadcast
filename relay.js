const router = require('express').Router({strict: true}),
    request = require('request'),
    broadcasters = require('./config.json').broadcasters || [];

router.get('/', async (req, res) => {
    res.render('index', {title: 'Overseer Broadcast', streams: broadcasters.map((broadcaster, index) => index)})
});

broadcasters.forEach(({ip}, index) => {
    router.use(`/broadcaster/${index}/`, async (req, res, next) => {
        const url = `http://${ip}:8000${req.path}`,
            r = request
                .get(url)
                .on('error', function() {
                    console.log(`error connecting to ${url}`);
                    res.status(500);
                    res.send('remote host not reachable');
                });
        req.pipe(r).pipe(res);
    })
});

module.exports = router;
