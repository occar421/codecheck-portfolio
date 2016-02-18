var Vue = require('vue');
var request = require('superagent');
var vm = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue.js!',
        projects: []
    },
    methods: {
        reverse: function () {
            data.message = data.message.split('').reverse().join('');
        },
        getProjects: function () {
            request.get('/api/projects').end(function (error, res) {
                data.projects = res.body;
            });
        },
        getProjectDetail: function (id) {
            request.get('/api/projects/' + id).end(function (error, res) {
                console.log(res.body);
            });
        }
    }
});
var data = vm.$data;
vm;
//# sourceMappingURL=app.js.map