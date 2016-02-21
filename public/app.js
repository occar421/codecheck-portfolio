Date.prototype.addHours = function (h) {
	this.setTime(this.getTime() + h * 60 * 60 * 1000);
	return this;
}

var vm = new Vue({
	el: '#app',
	data: {
		projects: [],
		projectDetail: {},
		tags: [],
		currentTag: "All",
		title: "",
		description: "",
		url: "",
		tagText: "",
		newTagText: "",
		isTagsEditing: false
	},
	computed: {
		isInvalidProject: function () {
			return this.title == "" || this.description == "";
		}
	},
	methods: {
		getAllProjects: function () {
			this.getTaggedProjects(this.currentTag);
		},
		getProjectDetail: function (id) {
			this.projectDetail = {};
			this.tagText = "";
			var self = this;
			$.getJSON('/api/projects/' + id, function (json) {
				var e = (/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)\.(\d{3})Z$/).exec(json.created_at);
				var dateTime = new Date(e[1], e[2], e[3], e[4], e[5], e[6], e[6]).addHours(9); // GMT-0 
				json.created_time = dateTime.getFullYear() + "/" + dateTime.getMonth() + "/" + dateTime.getDate() + " " + dateTime.getHours() + ":" + ("0" + dateTime.getMinutes()).slice(-2);
				self.projectDetail = json;
				self.tagText = json.tags.join(', ');
			});
			this.isTagsEditing = false;
		},
		deleteProject: function () {
			var self = this;
			$.ajax({
				url: '/api/projects/' + this.projectDetail.id,
				type: 'DELETE',
				success: function () {
					reset();
					self.projectDetail = {};
					self.tagText = "";
				}
			});
		},
		addProject: function () {
			if (!this.isInvalidProject) {
				var self = this;
				var tags = [];
				this.newTagText.split(',').forEach(function (v, i) { var str = v.trim(); if (str != "") { tags.push(str); } });
				$.post('/api/projects', { title: this.title, description: this.description, url: this.url, tags: tags }, function (data, textStatus, xhr) {
					reset();
					self.clearNewProject();
				});
			}
		},
		clearNewProject: function () {
			this.title = "";
			this.description = "";
			this.url = "";
			this.newTagText = "";
		},
		getAllTags: function () {
			var self = this;
			$.getJSON('/api/tags/', function (json) {
				self.tags = json;
			});
		},
		getTaggedProjects: function (tag) {
			var self = this;
			this.currentTag = tag;
			if (tag === "All") {
				$.getJSON('/api/projects', function (json) {
					self.projects = json;
				});
				return;
			}
			
			var self = this;
			$.getJSON('/api/projects/tagged/' + tag, function (json) {
				self.projects = json;
			});
			return;
		},
		editTags: function () {
			this.isTagsEditing = true;
			if (this.tagText != "") {
				this.tagText = this.tagText + ", ";
			}
		},
		updateTags: function () {
			var self = this;
			var tags = [];
			this.tagText.split(',').forEach(function (v, i) { var str = v.trim(); if (str != "") { tags.push(str); } });
			$.post('/api/projects/tags/', { id: this.projectDetail.id, tags: tags }, function (data, textStatus, xhr) {
				reset();
				self.tagText = data.join(", ");
			});
			
			this.isTagsEditing = false;
		},
		cancelUpdateTags: function () {
			this.isTagsEditing = false;
			this.tagText = this.projectDetail.tags.join(", ");
		}
	}
});
var reset = function () {
	vm.getAllProjects();
	vm.getAllTags();
};
reset();