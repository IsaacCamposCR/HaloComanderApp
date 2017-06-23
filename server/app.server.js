var express = require("express");
var app = express();
var path = require("path");
var rootPath = path.normalize(__dirname + "/../");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(rootPath + "/app"));

app.get("*", function (req, res) {
    res.sendFile(rootPath + "/app/index.html");
});

app.listen(8000);
console.log("Listening on port 8000...");