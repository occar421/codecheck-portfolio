/// <reference path="typings/express/express.d.ts" />
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server running with port', port);
});
//# sourceMappingURL=index.js.map