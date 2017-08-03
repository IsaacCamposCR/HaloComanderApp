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

app.get("*", function (req, res) {
    res.sendFile(rootPath + "/app/index.html");
});

app.listen(8080);