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
var client = new pg.Client(db_con_string);
client.on('error', (error) => {
	console.log(error.message);
});
client.connect();
process.on('exit', () => { client.end(); });

app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(express.static(__dirname + '/public'));

app.get('/api/projects', (req, res, next) => {
	const query = 'SELECT * FROM projects;';
	client.query(query, (error, result) => {
		if (error) {
			console.error(error.message);
			res.status(500).json('Error');
			return next();
		}

		res.json(result.rows);
		return next();
	});
});

app.post('/api/projects', (req, res, next) => {
	var title = req.body.title;
	var description = req.body.description;
	var url = req.body.url;
	var tags = req.body["tags[]"];

	if (title == null || description == null) {
		res.status(400).json('BadRequest');
		return next();
	}

	const projectQuery = 'INSERT INTO projects(url, title, description) VALUES($1, $2, $3) RETURNING *;'
	client.query(projectQuery, [url, title, description], (error, result) => {
		if (error) {
			console.error(error.message);
			res.status(500).json('Error');
			return next();
		}
		var json = result.rows[0];
		if (typeof tags === "string") {
			tags = [tags];
		}
		if (Array.isArray(tags)) {
			var array = tags as String[];
			const base = "INSERT INTO tags(project_id, name) VALUES";
			var a = "";
			for (var i = 0; i < array.length; i++) {
				a += "($1, $" + (i + 2) + ")"
				if (i < array.length - 1) {
					a += ",";
				}
			}
			const tagQuery = base + a + ";";
			array.unshift(json.id);
			client.query(tagQuery, array, (error, result) => {
				if (error) {
					console.error(error.message);
					res.status(500).json('Error');
					return next();
				}
			});
		}
		res.json(json);
		return next();
	});
});

app.get('/api/projects/:id', (req, res, next) => {
	const projectQuery = 'SELECT * FROM projects WHERE id=$1;';
	client.query(projectQuery, [req.params.id], (error, result) => {
		if (error) {
			console.error(error.message);
			res.status(500).json(error);
			return next();
		}

		if (result.rows.length == 0) {
			res.status(404).json('NotFound');
			return next();
		}

		var json = result.rows[0];
		const tagQuery = 'SELECT name FROM tags WHERE project_id=$1;';
		client.query(tagQuery, [req.params.id], (error, result) => {
			if (error) {
				console.error(error.message);
				res.status(500).json(error);
				return next();
			}

			if (result.rows.length != 0) {
				json.tags = result.rows.map((v, i, a) => v.name as String);
			} else {
				json.tags = [];
			}
			res.json(json);
			return next();
		});
	});
});

app.delete('/api/projects/:id', (req, res, next) => {
	const existenceQuery = 'SELECT id FROM projects WHERE id=$1;';
	client.query(existenceQuery, [req.params.id], (error, result) => {
		if (error) {
			console.error(error.message);
			res.status(500).json(error);
			return next();
		}
		if (result.rows.length == 0) {
			res.status(404).json('NotFound');
			return next();
		}

		const tagQuery = 'DELETE FROM tags WHERE project_id=$1;';
		client.query(tagQuery, [req.params.id], (error, result) => {
			if (error) {
				console.error(error.message);
				res.status(500).json(error);
				return next();
			}

			const projectQuery = 'DELETE FROM projects WHERE id=$1 RETURNING id;';
			client.query(projectQuery, [req.params.id], (error, result) => {
				if (error) {
					console.log(error.message);
					res.status(500).json(error);
					return next();
				}

				if (result.rows.length == 0) {
					res.status(404).json('NotFound');
					return next();
				}

				res.json(req.params.id);
				return next();
			});
		});
	});
});

app.get('/api/tags/', (req, res, next) => {
	const query = "SELECT DISTINCT ON(name) name FROM tags;";
	client.query(query, (error, result) => {
		if (error) {
			console.error(error.message);
			res.status(500).json(error);
			return next();
		}

		var json;
		if (result.rows.length == 0) {
			json = [];
		} else {
			json = result.rows.map((v, i, a) => v.name as String);
		}
		res.json(json);
		return next();
	});
});

app.get('/api/projects/tagged/:name', (req, res, next) => {
	var query = "SELECT * FROM projects WHERE id IN (SELECT project_id FROM tags WHERE name = $1);"
	client.query(query, [req.params.name], (error, result) => {
		if (error) {
			console.error(error.message);
			res.status(500).json(error);
			return next();
		}

		res.json(result.rows);
		return next();
	});
});

app.post('/api/projects/tags/', (req, res, next) => {
	var id = req.body.id;
	var deleteQuery = "DELETE FROM tags WHERE project_id=$1;";
	client.query(deleteQuery, [id], (error, result) => {
		if (error) {
			console.error(error.message);
			res.status(500).json(error);
			return next();
		}

		var tags = req.body["tags[]"];
		if (typeof tags === "string") {
			tags = [tags];
		}
		if (Array.isArray(tags)) {
			var array = tags as String[];
			const base = "INSERT INTO tags(project_id, name) VALUES";
			var a = "";
			for (var i = 0; i < array.length; i++) {
				a += "($1, $" + (i + 2) + ")"
				if (i < array.length - 1) {
					a += ",";
				}
			}

			const tagQuery = base + a + ";";
			array.unshift(id);
			client.query(tagQuery, array, (error, result) => {
				if (error) {
					console.error(error.message);
					res.status(500).json('Error');
					return next();
				}
			});
		}
		if (tags == null) {
			tags = [""];
		}
		tags.shift();
		res.json(tags);
		return next();
	});
});

app.listen(port, () => {
	console.log('Server running with port', port);
});