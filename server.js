const express = require('express'),
    app = express(),
    port = 3200;

app.set('view engine', 'pug');
app.use(require('./relay.js'));

app.listen(port, () => console.log(`Overseer Broadcast listening on port ${port}`));

