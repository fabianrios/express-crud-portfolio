var express = require('express'),
  router = express.Router(),
  db = require('../models');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  db.Article.findAll().then(function (articles) {
    // console.log(articles);
    res.render('index', {
      title: 'wtf?',
      articles: articles
    });
  });
});

router.get('/article/:id', function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    // console.log(article);
    res.render('show', {
      title: "Pantalla individual",
      article: article
    });
  });
});



router.get('/article/:id/edit', function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    res.render('edit', {
      title: "Edición",
      article: article
    });
  });
});


router.post('/articles', function (req, res, next) {
  var body = req.body
  console.log(body);
  db.Article.create({ title: body.title, text: body.text, url: 'fort-knox' }).then(function () {
   res.redirect('/');
  });
});

router.post('/article/:id/editar', function (req, res, next) {
  var id = req.params.id
  var body = req.body
  db.Article.findById(id).then(function (article) {
    article.update({ title: body.title, text: body.text, url: 'edited' }).then(function () {
     res.redirect('/');
    });
  });
});

router.get('/article/:id/destroy', function (req, res, next) {
  db.Article.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.redirect('/');
    });
});
