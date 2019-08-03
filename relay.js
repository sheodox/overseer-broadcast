const router = require('express').Router({strict: true}),
    request = require('request'),
    broadcasters = require('../config.json').broadcasters || [];

router.get('/', async (req, res, next) => {
    res.render('index', {title: 'Cameras', streams: broadcasters.map((ip, index) => index)})
});

broadcasters.forEach((ip, index) => {
    router.use(`/broadcaster/${index}/`, async (req, res, next) => {
        req.pipe(request.get(`http://${ip + req.path}`)).pipe(res);
    })
});

module.exports = router;
