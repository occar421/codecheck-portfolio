/// <reference path="typings/main.d.ts" />
var express = require('express');
var parser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;
app.use(parser.json());
app.use(express.static(__dirname + '/public'));
app.listen(port, function () {
    console.log('Server running with port', port);
});
//# sourceMappingURL=index.js.map