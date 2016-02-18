var vm = new Vue({
	el: '#app',
	data: {
		projects: [],
		projectDetail: {}
	},
	methods: {
		reverse: () => {
			data.message = (data.message as string).split('').reverse().join('');
		},
		getProjects: () => {
			$.getJSON('/api/projects', (json) => {
				data.projects = json;
			});
		},
		getProjectDetail: (id) => {
			$.getJSON('/api/projects/' + id, (json) => {
				data.projectDetail = json;
			});
		}
	}
});
var data = vm.$data;
vm;