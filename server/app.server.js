var express = require("express");
var app = express();
var path = require("path");
var rootPath = path.normalize(__dirname + "/../");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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

//http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
