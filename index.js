global.__base = __dirname;

const express = require('express');
const pg = require('pg');
const jwt = require('jsonwebtoken');
const config = require('./config.private');
const routes = require('./routes');

const app = express();
app.listen(config.entry.port, config.entry.host);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE, HEAD, OPTIONS");
  next();
});

app.use(function(req, res, next) {
  const noUser = () => {
    req.user = null;
    next();
  }

  if (req.headers && req.headers.authorization) {
    [auth_type, auth_token] = req.headers.authorization.split(' ');
    if (auth_type === 'JWT') {
      jwt.verify(auth_token, config.secret, function(err, decode) {
        if (err) req.user = null;
        req.user = decode;
        next();
      });
    } else noUser();
  } else noUser();

});

app.use('/api', routes);
