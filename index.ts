/// <reference path="typings/main.d.ts" />

import express = require('express');
import parser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;

app.use(parser.json());
app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
    console.log('Server running with port', port);
});