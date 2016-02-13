/// <reference path="typings/express/express.d.ts" />

import express = require('express');
var app = express();
var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log('Server running with port', port);
});