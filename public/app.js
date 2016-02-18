var vm = new Vue({
    el: '#app',
    data: {
        projects: [],
        projectDetail: {}
    },
    methods: {
        reverse: function () {
            data.message = data.message.split('').reverse().join('');
        },
        getProjects: function () {
            $.getJSON('/api/projects', function (json) {
                data.projects = json;
            });
        },
        getProjectDetail: function (id) {
            $.getJSON('/api/projects/' + id, function (json) {
                data.projectDetail = json;
            });
        }
    }
});
var data = vm.$data;
vm;
//# sourceMappingURL=app.js.map