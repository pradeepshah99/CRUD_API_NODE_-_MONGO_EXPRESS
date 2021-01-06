var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors')

const mongoose = require('mongoose');

// Requiring environment file:
require('dotenv').config();

var port = process.env.port;
var host = process.env.host;



app.use(bodyParser.urlencoded({extended:true }));
app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});
// app.use(cors({
//     origin:'http://localhost:4200'
//   }));
  

// making connectio with the database

var uri = "mongodb://localhost:27017/newUser";
mongoose.connect(uri, {useUnifiedTopology:true, useNewUrlParser:true});

var db = mongoose.connection;

db.once('open', (req, res)=>
{
    console.log('Connection Has been established');
});

//adding file for routing
var Ranstandcontroller = require('./controller/ranstandController');
app.use('/api', Ranstandcontroller);





app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});