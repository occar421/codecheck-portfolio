/// <reference path="typings/main.d.ts" />

import express = require('express');
import parser = require('body-parser');
import pg = require('pg');
var app = express();
var port: number = process.env.PORT || 3000;
var db_con_string: string = process.env.DATABASE_URL || (() => { // for Visual Studio debug
	var fs = require('fs');
	var str: string = fs.readFileSync(__dirname + "/.env", "UTF-8");
	var str_line = str.split(/\r?\n/).filter((v, i, a) => v.lastIndexOf('DATABASE_URL', 0) == 0)[0];
	return str_line.split("=")[1];
})();
db_con_string += '?ssl=true';

app.use(parser.json());
app.use(express.static(__dirname + '/public'));

app.get('/api/projects', (req, res, next) => {
	pg.connect(db_con_string, (error, client, done) => {
		client.query('SELECT * FROM projects', (error, result) => {
			done();
			if (!error) {
				res.json(result.rows);
			}
		});
	});
});

app.listen(port, () => {
	console.log('Server running with port', port);
});