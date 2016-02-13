/// <reference path="typings/main.d.ts" />

import express = require('express');
var app = express();
var port = process.env.PORT || 5000;

app.listen(port, function () {
    console.log('Server running with port', port);
});