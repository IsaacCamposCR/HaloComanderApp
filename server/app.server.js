var express = require("express");
var app = express();
var path = require("path");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var rootPath = path.normalize(__dirname + "/../");
app.use(express.static(rootPath + "/app"));
app.use(express.static(rootPath + "/build"));

var cors = require('express-cors');
app.use(cors({
    allowedOrigins: [
        'haloapi.com', 'photos.google.com'
    ]
}));

var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express');

var options = {
    key: fs.readFileSync(rootPath + '/ssl/privkey.pem'),
    cert: fs.readFileSync(rootPath + '/ssl/fullchain.pem'),
};

app.get("*", function (req, res) {
    res.sendFile(rootPath + "/app/index.html");
});

https.createServer(options, app).listen(443, () => {
    console.log("Server running on port 443");
});

var httpw = express();

httpw.get('*', function (req, res) {
    res.redirect('https://' + req.get('host'));
})
httpw.listen(80, function () {
    console.log('Redirect server is running on port 80');
});