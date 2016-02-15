﻿/// <reference path="typings/main.d.ts" />

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
var client = new pg.Client(db_con_string);
client.connect();
process.on('exit', () => { client.end(); });

app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(express.static(__dirname + '/public'));

app.get('/api/projects', (req, res, next) => {
	const sql = 'SELECT * FROM projects';
	client.query(sql, (error, result) => {
		if (error) {
			console.log(error.message);
			res.status(500).json('Error');
		} else {
			res.json(result.rows);
		}
		return next();
	});
});

app.post('/api/projects', (req, res, next) => {
	var title = req.body.title;
	var description = req.body.description;
	var url = req.body.url;

	if (title == null || description == null) {
		res.status(400).json('BadRequest');
		return next();
	}

	const sql = 'INSERT INTO projects(url, title, description) VALUES($1, $2, $3) RETURNING *;'
	client.query(sql, [url, title, description], (error, result) => {
		if (error) {
			console.log(error.message);
			res.status(500).json('Error');
		} else {
			res.json(result.rows[0]);
		}
		return next();
	});
});

app.listen(port, () => {
	console.log('Server running with port', port);
});