import Vue = require('vue');
import request = require('superagent');

var vm = new Vue({
	el: '#app',
	data: {
		message: 'Hello Vue.js!',
		projects: []
	},
	methods: {
		reverse: () => {
			data.message = (data.message as string).split('').reverse().join('');
		},
		getProjects: () => {
			request.get('/api/projects').end((error, res) => {
				data.projects = res.body;
			});
		},
		getProjectDetail: (id) => {
			request.get('/api/projects/' + id).end((error, res) => {
				console.log(res.body);
			});
		}
	}
});
var data = vm.$data;
vm;