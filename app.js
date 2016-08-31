const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.listen(3000, () => {
    console.log('The server is listening on port 3000.');
});