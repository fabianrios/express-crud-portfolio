var express = require('express'),
  router = express.Router(),
  db = require('../models');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  db.Article.findAll().then(function (articles) {
    console.log(articles);
    res.render('index', {
      title: 'wtf?',
      articles: articles
    });
  });
});

router.get('/article/:id', function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    console.log(article);
    res.render('show', {
      title: "Pantalla individual",
      article: article
    });
  });
});


router.post('/articles', function (req, res, next) {
  var id = req.params.id
  db.Article.create({ title: 'fnord', text: 'omnomnom', url:  }).then(function (article) {
    console.log(article);
    res.render('show', {
      title: "Pantalla individual",
      article: article
    });
  });
});
