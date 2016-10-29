var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');

var apiBase = "http://www.omdbapi.com/?";


app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/uuid', function(req, res){
  res.send({uuid:uuid.v1()});
});

app.get('/favorites/:uuid', function(req, res){
  var uuid = req.params.uuid;
  if (!uuid)
    res.send("Error");
  else {
    var data = fs.readFileSync('./data.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(data[uuid]);
  }
});

app.post('/favorites', function(req, res){
  var uuid = req.body.uuid;
  var details = req.body.details;
  if(!uuid || !details)
    res.send("Error");
  else{
    var data = fs.readFileSync('./data.json');
    if (data[uuid])
      data[uuid].push(details);
    else
      data[uuid] = [details];
    fs.writeFile('./data.json', JSON.stringify(data));
    res.setHeader('Content-Type', 'application/json');
    res.send(data[uuid]);
  }
});

app.listen(process.evn.PORT || 3000, function(){
  console.log("Listening on port 3000");
});
