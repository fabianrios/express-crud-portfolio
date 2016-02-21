var express = require('express'),
  router = express.Router(),
  db = require('../models');
  
var multer = require('multer');
var upload = multer({dest:'./img/uploads/'});
var friendlyUrl = require('friendly-url');
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'fabianrios', 
  api_key: '993579761283834', 
  api_secret: 'rkFGhUYg0shUm4m7Qtnb1qWSlEQ' 
});


var http = require('http');
var path = require('path');
var assert = require('assert');

var enviroment = process.env.NODE_ENV || 'development';
if (enviroment == 'development'){
  var env = require('node-env-file');
  env(path.dirname(require.main.filename) + '/.env');
}

var AWS_ACCESS_KEY =  process.env.S3_ACCESS_KEY;
var AWS_SECRET_KEY =process.env.S3_SECRET_ACCESS_KEY;
var S3_BUCKET = process.env.S3_BUCKET_NAME;

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.locals = {
      pageTitle: "map",
    };
    res.render('index', {
      title: 'root',
      logo: "logo_white.png"
    });
});

router.get('/blog', function (req, res, next) {
  db.Article.findAll().then(function (articles) {
    // console.log(articles);
    res.render('blog', {
      title: 'blog',
      articles: articles,
      logo: "group-2.png"
    });
  });
});

// router.post('/upload_image',upload.single('image_upload'), function(req, res){
//   console.log(req.file);
//   cloudinary.uploader.upload(req.file.path, function(result) {
//     console.log("result",result);
//     res.write(JSON.stringify(result));
//     res.end();
//   });
// });

router.get('/article/create', function (req, res, next) {
    res.render('create', {
      title: 'Create new article',
      logo: "group-2.png"
    });
});

router.get('/experiences', function (req, res, next) {
    res.render('experiences', {
      title: 'Experiencias',
      logo: "group-2.png"
    });
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {
      title: 'Contacto',
      logo: "group-2.png"
    });
});

router.get('/article/:id', function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    // console.log(article)
    
    res.locals = {
      pageTitle: "articles",
    };
    
    res.render('show', {
      title: article.title,
      article: article,
      logo: "logo_white.png"
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


router.post('/article/like', function (req, res, next) {
  var id = req.body.id
  db.Article.findById(id).then(function (article) {
   var like = article.like || 0
   like++;
   article.update({like: like }).then(function () {
      res.write(JSON.stringify(like));
      res.end();
   });
  });
});


router.post('/articles',upload.single('image_upload'), function (req, res, next) {
  var body = req.body;
  var urlbody = friendlyUrl(body.title);
  cloudinary.uploader.upload(req.file.path, function(result) {
    db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, images: result }).then(function () {
     res.redirect('/');
    });
  });
});

router.post('/article/:id/editar', function (req, res, next) {
  var id = req.params.id
  var body = req.body
  var urlbody = friendlyUrl(body.title);
  db.Article.findById(id).then(function (article) {
    article.update({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category }).then(function () {
     res.redirect('/blog');
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

