let express = require('express');
let app = express();
let bodyParser = require('body-parser');

require('dotenv').config()
console.log('Hello World');
// app.get("/", function(req, res) {
//     res.send("Hello Express");
// });
app.use(function(req, res, next) {
    console.log(req.method + " " + req.path + " - " + req.ip);
    next();
});
app.get("/now", function(req, res, next) {
    req.time=new Date().toString();
    next();
}, function(req, res) {
    res.json({"time": req.time});
});
app.get("/:word/echo", function(req, res) {
    res.json({"echo": req.params.word});
});
app.get("/name",function(req,res){
    var firstname=req.query.first;
    var lastname=req.query.last;
    res.json({"name":firstname+" "+lastname});
});
app.use(bodyParser.urlencoded({extended: false}));
app.post("/name", function(req, res) {
    var firstname=req.body.first;
    var lastname=req.body.last;
    res.json({"name":firstname+" "+lastname});
});
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/views/index.html");
});
app.use("/public", express.static(__dirname + "/public"));  
app.get("/json", function(req, res) {
    res.json({"message": "Hello json"});
    process.env.MESSAGE_STYLE === "uppercase" ? res.json({"message": "HELLO JSON"}) : res.json({"message": "Hello json"});
});



































 module.exports = app;
