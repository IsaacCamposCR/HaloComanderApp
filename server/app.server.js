var express = require("express");
var app = express();
var path = require("path");
var rootPath = path.normalize(__dirname + "/../");
var bodyParser = require("body-parser");
var cors = require('express-cors');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(rootPath + "/app"));
app.use(express.static(rootPath + "/build"));

app.use(cors({
    allowedOrigins: [
        'haloapi.com', 'photos.google.com'
    ]
}));

app.get("*", function (req, res) {
    res.sendFile(rootPath + "/app/index.html");
});

var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express');

var options = {
    key: fs.readFileSync(rootPath + '/ssl/privkey.pem'),
    cert: fs.readFileSync(rootPath + '/ssl/fullchain.pem'),
};

var server = https.createServer(options, app).listen(8080, function () {
    console.log("Express server listening on port " + 8080);
});


//app.listen(8080);
console.log("Listening on port 8080...");