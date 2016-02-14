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
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(express.static(__dirname + '/public'));
app.get('/api/projects', function (req, res, next) {
    pg.connect(db_con_string, function (error, client, done) {
        client.query('SELECT * FROM projects', function (error, result) {
            done();
            if (!error) {
                res.json(result.rows);
            }
        });
    });
});
app.post('/api/projects', function (req, res, next) {
    var title = req.body.title;
    var description = req.body.description;
    var url = req.body.url;
    if (title == null || description == null) {
        res.status(400).json('BadRequest');
        return next();
    }
    pg.connect(db_con_string, function (error, client, done) {
        client.query("INSERT INTO projects(url, title, description) VALUES('" + url + "', '" + title + "', '" + description + "') RETURNING *;", function (error, result) {
            done();
            if (!error) {
                res.json(result.rows[0]);
            }
        });
    });
});
app.listen(port, function () {
    console.log('Server running with port', port);
});
//# sourceMappingURL=index.js.map