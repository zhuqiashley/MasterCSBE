
require('dotenv').config();

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
var cors = require('cors');
const rateLimit = require("express-rate-limit");

const Base = require('./api/index');

app.use(bodyParser.json());
app.use(cors())
app.options('*', cors())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    next();
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150 // limit each IP to 150 requests per windowMs
});
  
//  apply to all requests
app.use(limiter);
  
// Routing
app.use('/api/', Base);

app.listen(3001, () => {
    console.log('App listening on port 3001');
});