var express = require('express');
var app = express();
var cors = require('cors')
var mongoUtils = require('./mongodb');
var bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = 3000;

app.get('/', function(req, res){
    res.send('Hello Express');
});

mongoUtils.connect(function(db){
  app.use('/api/v1/projects', require('./routes/Project'));

  app.listen(port, function(){
    console.log('Server is running on port:', port);
  });
})
