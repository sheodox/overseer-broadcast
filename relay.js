const router = require('express').Router({strict: true}),
    request = require('request'),
    broadcasters = require('./config.json').broadcasters || [];

router.get('/', async (req, res) => {
    res.render('index', {title: 'Cameras', streams: broadcasters.map((broadcaster, index) => index)})
});

broadcasters.forEach(({ip}, index) => {
    router.use(`/broadcaster/${index}/`, async (req, res, next) => {
        console.log(`http://${ip}:8000/${req.path}`);
        req.pipe(request.get(`http://${ip}:8000${req.path}`)).pipe(res);
    })
});

module.exports = router;
