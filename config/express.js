var express = require('express');
var glob = require('glob');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var exphbs  = require('express-handlebars');
var dateFormat = require('dateformat');

var session = require('express-session');
    

module.exports = function(app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';
  
  app.engine('handlebars', exphbs({
    layoutsDir: config.root + '/app/views/layouts/',
    defaultLayout: 'main',
    partialsDir: [config.root + '/app/views/partials/'],
    helpers: {
      ifCond: function (v1, v2, options) { 
        if(v1 == v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      upperCase: function(str) {
        return str.toUpperCase();
      },
      shortDate: function(str) {
        return dateFormat(str, "mmmm dd, yyyy - h:MM");
      }
    }
  }));
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'handlebars');

  // app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(express.static(config.root + '/public'));
  app.use('/scripts', express.static(config.root + '/node_modules'));
  app.use('/fonts', express.static(config.root + '/node_modules/font-awesome/fonts'));
  app.use(session({ secret: 'babyiloveu' }));
  app.use(methodOverride());

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    return res.render('404', {
       url: req.url,
       message: "No logramos encontrar lo que buscabas.",
       error: err,
       yes404: true, 
       pageTitle: "404",
       author: "Fabián Ríos",
       description: "María Bahamón website",
       logo: "group-2.png",
       bg: "../img/404.jpg"
    });
    next(err);
  });
  
  if(app.get('env') === 'development'){
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error',
        bg: "../img/404.jpg"
      });
    });
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error',
        bg: "../img/404.jpg"
      });
  });
  
  app.use(function (req, res, next) {
     res.locals = {
       pageTitle: "The Home Page",
       author: "Fabián Ríos",
       description: "Aram's website"
     };
  });
  
  app.use(function(req, res, next){
    res.status(404);
    // respond with html page
    if (req.accepts('html')) {
      
      return res.render('404', {
         url: req.url,
         pageTitle: "404",
         author: "Fabián Ríos",
         description: "Aram's website",
         logo: "group-2.png",
         bg: "404.jpg" 
      });
      
    }
    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not found' });
      return;
    }
  });

};
