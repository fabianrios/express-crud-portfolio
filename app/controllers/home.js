var express = require('express'),
  router = express.Router(),
  db = require('../models');
  
var friendlyUrl = require('friendly-url');

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  db.Article.findAll().then(function (articles) {
    // console.log(articles);
    res.render('index', {
      title: 'root',
      articles: articles
    });
  });
});

router.get('/article/create', function (req, res, next) {
    res.render('create', {
      title: 'Create new article',
    });
});

router.get('/experiences', function (req, res, next) {
    res.render('experiences', {
      title: 'Experiencias',
    });
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {
      title: 'Contacto',
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
  var urlbody = friendlyUrl(body.title);
  db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category }).then(function () {
   res.redirect('/');
  });
});

router.post('/article/:id/editar', function (req, res, next) {
  var id = req.params.id
  var body = req.body
  var urlbody = friendlyUrl(body.title);
  console.log(urlbody);
  db.Article.findById(id).then(function (article) {
    article.update({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category }).then(function () {
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
