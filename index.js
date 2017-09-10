const express = require('express');
const pg = require('pg');
const config = require('./config.private');
const routes = require('./routes');

const app = express();
app.listen(config.entry.port, config.entry.host);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, HEAD");
  next();
});

app.use('/api', routes);
