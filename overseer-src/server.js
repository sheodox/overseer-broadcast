const express = require('express'),
	bodyParser = require('body-parser'),
    app = express(),
    port = 3200;

app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(require('./relay.js'));
app.use(require('./lights'));
app.use(require('./weather'));
app.use(express.static('static'));

app.listen(port, () => console.log(`Overseer Broadcast listening on port ${port}`));

