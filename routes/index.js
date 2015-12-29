'use strict';

var _ = require('lodash');
var results = require('../results');

module.exports = function(app) {

  app.get('/', function(req, res) {
    return res.render('index', {
      disableMathbox: false
    });
  });

  app.get('/easter-egg', function(req, res) {
    return res.render('easter-egg', {
      disableMathbox: true
    });
  });

  app.post('/result', function(req, res) {
    var name = req.body.name;
    var phone = req.body.phone;
    name = name.trim();
    phone = phone.trim();
    if (!name || !phone) {
      return res.render('error');
    }
    var data = results;
    var found = _.findWhere(data, {
      name: name,
      phone: phone
    });
    var vdcSpecialCase = {};
    var renderPage = 'error';
    var department = '';
    var errorType = '';
    if (found) {
      renderPage = 'result_yes';
      department = found.department.toLowerCase();
    } else {
      errorType = 'both_wrong';
      renderPage = 'error';
      found = _.findWhere(data, {
        name: name
      });
      if (found) {
        errorType = 'wrong_phone';
      } else {
        found = _.findWhere(data, {
          phone: phone
        });
        if (found) {
          errorType = 'wrong_name';
        } else {
          renderPage = 'result_sorry';
        }
      }
    }
    return res.render(renderPage, {
      name: name,
      department: department,
      vdcSpecialCase: vdcSpecialCase,
      errorType: errorType,
      disableMathbox: false
    });
  });

  app.use(function(req, res) {
    return res.redirect('/');
  });
};