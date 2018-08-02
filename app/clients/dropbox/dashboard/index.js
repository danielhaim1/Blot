var Express = require('express');
var middleware = require('./middleware');
var dashboard = Express.Router();

dashboard
  .use(middleware.load_dropbox_account)
  .get('/', function (req, res) {
    res.render(__dirname + '/views/index.html');
  })
  .get('/change-permission', function (req, res) {
    res.render(__dirname + '/views/change_permission.html');
  })
  .use('/select-folder', require('./select_folder'))
  .use('/authenticate', require('./authenticate'))
  .post('/disconnect', require('./disconnect'));

module.exports = dashboard;