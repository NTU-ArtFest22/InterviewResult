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
  //     from: 'from',
  //     depaprtment: 'depaprtment',
  //     vdc: 'vdcSpecialCase',
  //     errorType: 'errorType'
  //   });
  // });

  app.post('/result', function(req, res) {
    var name = req.body.name;
    var phone = req.body.phone;
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
    var depaprtment = '';
    var from = '';
    var errorType = '';
    if (found) {
      depaprtment = found.depaprtment;
      from = found.from;
      switch (depaprtment) {
        case 'day':
          renderPage = 'result_day';
          break;
        case 'night':
          renderPage = 'result_night';
          break;
        case 'dream':
          renderPage = 'result_dream';
          break;
        case 'marketing':
          renderPage = 'result_marketing';
          break;
        case 'administration':
          renderPage = 'result_administration';
          break;
        case 'hr':
          renderPage = 'result_HR';
          break;
        case 'design':
          renderPage = 'result_design';
          break;
        case 'pr':
          renderPage = 'result_pr';
          break;
        case 'r2d2':
          renderPage = 'result_r2d2';
          break;
        case 'vdc':
          renderPage = 'result_vdc';
          vdcSpecialCase = found.vdcSpecialCase;
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
        }
        else{
          renderPage = 'result_sorry';
        }
      }
    }
    return res.render(renderPage, {
      name: name,
      from: from,
      depaprtment: depaprtment,
      vdcSpecialCase: vdcSpecialCase,
      errorType: errorType
    });
  });

  app.use(function(req, res) {
    return res.redirect('/');
  });
};