/// <reference path="typings/main.d.ts" />
var express = require('express');
var parser = require('body-parser');
var pg = require('pg');
var request = require('request');
var app = express();
var port = process.env.PORT || 3000;
var db_con_string = process.env.DATABASE_URL || (function () {
    var fs = require('fs');
    var str = fs.readFileSync(__dirname + "/.env", "UTF-8");
    var str_line = str.split(/\r?\n/).filter(function (v, i, a) { return v.lastIndexOf('DATABASE_URL', 0) == 0; })[0];
    return str_line.split("=")[1];
})();
var client = new pg.Client(db_con_string);
client.on('error', function (error) {
    console.log(error.message);
});
client.connect();
process.on('exit', function () { client.end(); });
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get('/api/projects', function (req, res, next) {
    var sql = 'SELECT * FROM projects';
    client.query(sql, function (error, result) {
        if (error) {
            console.log(error.message);
            res.status(500).json('Error');
        }
        else {
            res.json(result.rows);
        }
        return next();
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
    var sql = 'INSERT INTO projects(url, title, description) VALUES($1, $2, $3) RETURNING *;';
    client.query(sql, [url, title, description], function (error, result) {
        if (error) {
            console.log(error.message);
            res.status(500).json('Error');
        }
        else {
            res.json(result.rows[0]);
        }
        return next();
    });
});
app.get('/api/projects/:id', function (req, res, next) {
    var sql = 'SELECT * FROM projects WHERE id=$1';
    client.query(sql, [req.params.id], function (error, result) {
        if (error) {
            console.log(error.message);
            res.status(500).json(error);
        }
        else {
            if (result.rows.length != 0) {
                res.json(result.rows[0]);
            }
            else {
                res.status(404).json('NotFound');
            }
        }
        return next();
    });
});
app.delete('/api/projects/:id', function (req, res, next) {
    var sql = 'DELETE FROM projects WHERE id=$1 RETURNING id';
    client.query(sql, [req.params.id], function (error, result) {
        if (error) {
            console.log(error.message);
            res.status(500).json(error);
        }
        else {
            if (result.rows.length != 0) {
                res.json(req.params.id);
            }
            else {
                res.status(404).json('NotFound');
            }
        }
        return next();
    });
});
app.get('/', function (req, res, next) {
    request.get({ url: 'http://localhost:' + port + '/api/projects', json: true }, function (error, result, body) {
        if (error) {
            console.log(error.message);
            res.status(500).json('Error');
        }
        else {
            if (result.statusCode == 200) {
                res.render('main', { results: body });
            }
            else {
                console.log('error status code: ' + result.statusCode);
                res.status(500).json('Error');
            }
        }
        return next();
    });
});
app.listen(port, function () {
    console.log('Server running with port', port);
});
//# sourceMappingURL=index.js.map