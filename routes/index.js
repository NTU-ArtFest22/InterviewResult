'use strict';

var _ = require('lodash');
var results = require('../results');

module.exports = function(app) {

  app.get('/', function(req, res) {
    return res.render('index');
  });
  // app.get('/page/:page', function(req, res) {
  //   var renderPage = req.params.page;
  //   return res.render(renderPage, {
  //     name: 'name',
  //     department: 'department',
  //     vdc: 'vdcSpecialCase',
  //     errorType: 'errorType'
  //   });
  // });

  app.get('/easter-egg',function(req,res){
    return res.render('easter-egg');
  });
  app.get('/effect',function(req,res){
    return res.render('effect');
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
      department = found.department.toLowerCase();
      switch (department) {
        case 'day':
          renderPage = 'result_yes';
          break;
        case 'night':
          renderPage = 'result_yes';
          break;
        case 'dream':
          renderPage = 'result_yes';
          break;
        case 'marketing':
          renderPage = 'result_yes';
          break;
        case 'administration':
          renderPage = 'result_yes';
          break;
        case 'hr':
          renderPage = 'result_yes';
          break;
        case 'design':
          renderPage = 'result_yes';
          break;
        case 'pr':
          renderPage = 'result_yes';
          break;
        case 'r2d2':
          renderPage = 'result_yes';
          break;
        case 'vdc':
          renderPage = 'result_yes';
          break;
        default:
          renderPage = 'error';
          break;
      }
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
      errorType: errorType
    });
  });

  app.use(function(req, res) {
    return res.redirect('/');
  });
};