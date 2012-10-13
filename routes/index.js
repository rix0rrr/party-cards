/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Sioux X-Mas Board', page: 'index' })
};

exports.post = function(req, res) {
  res.render('post', { title: 'Plaats een berichtje', page: 'post' });
};

exports.view = function(req, res) {
  res.render('view', { title: 'Sioux Kerstbord', page: 'view' });
};
