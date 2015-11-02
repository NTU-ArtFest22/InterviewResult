'use strict';

var _ = require('lodash');

module.exports = function(app) {

  app.get('/', function(req, res) {
    return res.render('index');
  });

  app.post('/result', function(req, res) {
    var name = req.body.name;
    var phone = req.body.phone;
    if (!name || !phone) {
      return res.render('error');
    }
    return res.render('result', {
      name: name
    });
  });

  app.use(function(req, res) {
    req.flash('error', '404 Page Not Found');
    return res.redirect('/');
  });
};