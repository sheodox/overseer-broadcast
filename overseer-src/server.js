const express = require('express'),
	bodyParser = require('body-parser'),
    app = express(),
    port = 3200,
	bootTime = Date.now();

app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(require('./relay.js'));
app.use(require('./lights'));
app.use(require('./weather'));
app.use(express.static('static'));

//used to refresh headless pages
app.use('/meta', (req, res) => {
	res.json({bootTime})
});

app.listen(port, () => console.log(`Overseer Broadcast listening on port ${port}`));

