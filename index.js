/// <reference path="typings/main.d.ts" />
var express = require('express');
var parser = require('body-parser');
var pg = require('pg');
var app = express();
var port = process.env.PORT || 3000;
var db_con_string = process.env.DATABASE_URL || (function () {
    var fs = require('fs');
    var str = fs.readFileSync(__dirname + "/.env", "UTF-8");
    var str_line = str.split(/\r?\n/).filter(function (v, i, a) { return v.lastIndexOf('DATABASE_URL', 0) == 0; })[0];
    return str_line.split("=")[1];
})();
db_con_string += '?ssl=true';
app.use(parser.json());
app.use(express.static(__dirname + '/public'));
app.get('/api/projects', function (req, res, next) {
    res.json('Some data...');
    return next();
});
app.listen(port, function () {
    console.log('Server running with port', port);
});
//# sourceMappingURL=index.js.map