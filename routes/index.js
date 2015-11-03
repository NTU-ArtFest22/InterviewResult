'use strict';

var _ = require('lodash');
var results = require('../results');

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
    var data = results;
    var found = _.findWhere(data, {
      name: name,
      phone: phone
    });
    var render_page = 'error';
    if (found) {
      switch (found.depaprtment) {
        case 'day':
          render_page = 'result_day';
          break;
        case 'night':
          render_page = 'result_night';
          break;
        case 'dream':
          render_page = 'result_dream';
          break;
        case 'marketing':
          render_page = 'result_marketing';
          break;
        case 'administration':
          render_page = 'result_administration';
          break;
        case 'hr':
          render_page = 'result_hr';
          break;
        case 'design':
          render_page = 'result_design';
          break;
        case 'pr':
          render_page = 'result_pr';
          break;
        case 'r2d2':
          render_page = 'result_r2d2';
          break;
        default:
          render_page = 'error';
          break;
      }
    }
    return res.render(render_page, {
      name: name
    });
  });

  app.use(function(req, res) {
    return res.redirect('/');
  });
};