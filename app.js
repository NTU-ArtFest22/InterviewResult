'use strict';

var settings = require('./settings');

var express = require('express');
var http = require('http');
var path = require('path');

var serveFavicon = require('serve-favicon');
var compression = require('compression');
var serveStatic = require('serve-static');
var errorhandler = require('errorhandler');
var methodOverride = require('method-override');
var busboy = require('connect-multiparty');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes');

exports.server = function() {
  var app = express();
  // development only
  if ('development' === app.get('env')) {
    app.use(errorhandler());
  }

  app.set('port', settings.port || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(morgan('dev'));
  app.use(compression());
  app.use(serveFavicon(__dirname + '/public/favicon.ico'));

  app.use(busboy({
    highWaterMark: 2 * 1024 * 1024,
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  }));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(methodOverride('_method'));


  app.use(serveStatic(path.join(__dirname, 'public'), {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }));

  routes(app);
  // all environments
  app.use(function(err, req, res, next) {
    console.log(err.stack);
    return res.status(500).send('Something broken!');
  });

  var port = app.get('port');
  http.createServer(app).listen(port, function() {
    console.log('Express server listening on port ' + port);
  });
  // If the Node process ends, close the Mongoose connection 
};

process.on('unhandledRejection', function(reason, p) {
  console.log(reason);
  console.log(p);
});

process.on('uncaughtException', function(err) {
  console.log(err.stack);
});