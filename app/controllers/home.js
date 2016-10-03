var express = require('express'),
  router = express.Router(),
  db = require('../models');
  
var multer = require('multer');
var upload = multer({dest:'./img/uploads/'});
var friendlyUrl = require('friendly-url');
var cloudinary = require('cloudinary');
var dateFormat = require('dateformat');
var nodemailer = require('nodemailer');

//email
var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.GMAILEMAIL, // Your email id
            pass: process.env.GMAILPASS // Your password
        }
    });
// /email

// cloudinary 
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
// /cloudinary

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'mormon';

    
function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

var notify = function(req, res, next) {
  db.Client.findAll().then(function (clients) {
    var clientes = 0, contacts = 0, now = new Date();
    for (var i = 0; i < clients.length; i++){
      if (dateFormat(clients[i].createdAt, "W") == dateFormat(clients[i].now, "W")){
        if(clients[i].flag == 0){
          clientes = clientes + 1;
        }else {
          contacts = contacts + 1;
        }
      }
    }
    req.session.clients = clientes;
    req.session.contacts = contacts;
    return next();
  })
}


var authorize = function(req, res, next) {
   if (req.session && req.session.admin){
     
     notify();
     
     return next();
    } else{
      res.render('login', {
        title: 'Inicio de sesión',
        logo: "group-2.png",
        error: "No esta autorizado inicie sesión"
      });
    }
}

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
      pageTitle: "form",
      background: true,
      logo: "logo_white.png",
      bg: "../img/bg1.jpg",
      home: true,
      cloudinary_account: process.env.CLOUDINARY_NAME
    };
    res.render('index', {
      experiences: true,
      title: 'home'
    });
});

router.post('/info', function (req, res, next) {
  var body = req.body;
  var query = [];
  if (!body.email){
  function traveltype(travel){
    if (travel == "vip"){
        query.push({
          vip:{$lte: body.budget}
        },{
          title: {$ilike: body.where+"%"} 
        });
    }else if (travel == "incognito"){
        query.push({
          incognito:{$lte: body.budget}
        },{
          title: {$ilike: body.where+"%"} 
        });
    }else if (body.travel == "corporativo"){
        query.push({
          corporate:{$lte: body.budget}
        },{
          title: {$ilike: body.where+"%"} 
        });
    }
    return query;
  }
  traveltype(body.travel);
  if (!body.where){
    query.splice(1, 1);;
  }
  db.Country.findAll({ where: {
      $or: query
     } 
   }).then(function(country) {
    var si = "false", no = "false";
    if (body.know == "si"){
      si = "selected";
    }else{
      no = "selected";
    }
    return res.render('map', {
      countries:country,
      country:country[0],
      experiences: true,
      inlineform: true,
      si: si,
      no: no,
      where: body.where,
      budget: body.budget,
      travel: body.travel,
      title: 'check',
      pageTitle: "map",
      background: true,
      logo: "logo_white.png",
      cloudinary_account: process.env.CLOUDINARY_NAME
    })
  })
  }else{
   // enviar info de clientes
    db.Client.create({ mail: body.email, country: body.where, experience: body.travel  }).then(function () {
      var mailOptions = {
          from: '"arams" <hola@arams.com.co>', // sender address
          to: 'sensaciones@arams.com.co', // list of receivers
          subject: 'Nuevo contacto 👥', // Subject line
          text: 'Correo: ' + body.email + ' País: ' + body.where + 'Tipo de viaje: ' + body.travel, // plaintext body
          html: '📩 <b>Correo:</b> ' + body.email + '<br /> <b>País:</b> ' + body.where + '<br /> 💵 <b>Tipo de viaje:</b> ' + body.travel// html body
      };
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return console.log(error);
          }
          console.log('Message sent: ' + info.response);
          var json = JSON.stringify("success");
          res.write(json);
          res.end();
      });
    });
  }
  
});

router.get('/map', function (req, res, next) {
    res.locals = {
      pageTitle: "map",
      background: true,
      logo: "logo_white.png",
      experiences: true,
      inlineform: true
    };
    res.render('map', {
      title: 'Home',
      cloudinary_account: process.env.CLOUDINARY_NAME
    });
});

router.get(['/login', '/admin'], function (req, res, next) {
    res.render('login', {
      title: 'Inicio de sesión',
      logo: "group-2.png",
      query: true
    });
});

router.post('/login', function (req, res, next) {
  if (!req.body.username || !req.body.password){
    return res.render('login',{
       error: 'los campos no pueden estar vacios',
       title: 'Inicio de sesión',
       logo: "group-2.png"
    });
  }
  db.User.findOne({ where: {username: req.body.username, password: encrypt(req.body.password)} }).then(function(user) {
    
    if (!user) {
      return res.render("login", {
         error: "No se encontro nadie con esas credenciales.",
         title: "Inicio de sesión",
         logo: "group-2.png" 
      });
    }
    
    req.session.user = user; 
    req.session.admin = user.admin;
    var url = req.url;
    res.redirect('/countries_search');
    
  });
});

router.get('/logout', function (req, res, next) {
   req.session.destroy(); 
   res.redirect('/');
});

router.get('/country/create', authorize, notify, function (req, res, next) {
    res.render('create_country', {
      title: 'Crear nuevo país',
      logo: "group-2.png",
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      user: req.session.user,
      countries_search: "active"
    });
});

router.get('/country/:id/edit', authorize, notify, function (req, res, next) {
  var id = req.params.id
  db.Country.findById(id).then(function (country) {
    res.render('edit_country', {
      title: "Edición de país",
      country: country,
      logo: "group-2.png",
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      user: req.session.user,
      countries_search: "active",
      cloudinary_account: process.env.CLOUDINARY_NAME
    });
  });
});

router.post('/country/:id/editar', authorize, notify, upload.single('image_upload'), function (req, res, next) {
  var id = req.params.id
  var body = req.body
  var file = req.file;
  db.Country.findById(id).then(function (country) {
    if(typeof file !== 'undefined'){
    cloudinary.uploader.upload(file.path, function(result) {
      country.update({ title: body.pais, text: body.texto, url: body.url, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate, lat: body.lat, long: body.long }).then(function () {
       res.redirect('/countries_search');
      });
    },{ public_id: country.version, invalidate: true });
    } else{
      country.update({ title: body.pais, text: body.texto, url: body.url, vip: body.vip, incognito: body.incognito, corporate: body.corporate, lat: body.lat, long: body.long }).then(function () {
       res.redirect('/countries_search');
      });
    }
  });
});

router.post('/countries', authorize, notify, upload.single('image_upload'), function (req, res, next) {
  var body = req.body;
  var urlbody = friendlyUrl(body.pais);
  if(typeof req.file !== 'undefined'){
    cloudinary.uploader.upload(req.file.path, function(result) {
      db.Country.create({ title: body.pais, text: body.texto, url: urlbody, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate }).then(function () {
       res.redirect('/countries_search');
      });
    });
  }else{
    db.Country.create({title: body.pais, text: body.texto, url: urlbody, vip: body.vip, incognito: body.incognito, corporate: body.corporate}).then(function () {
     res.redirect('/countries_search');
    });
  }
});

router.get('/countries_search', notify, authorize, function (req, res, next) {
  db.Country.findAll().then(function (countries) {
    
    res.render('countries_search', {
      title: 'Buscador de paises',
      countries: countries,
      logo: "group-2.png",
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      user: req.session.user,
      countries_search: 'active',
      cloudinary_account: process.env.CLOUDINARY_NAME
    });
    
  });
});


router.get('/countries_all', function (req, res, next) {
  var query = [], body = req.query;
  
  function traveltype(travel){
    if (travel == "vip"){
        query.push({
          vip:{$lte: body.budget}
        },{
          title: {$ilike: body.where+"%"} 
        });
    }else if (travel == "incognito"){
        query.push({
          incognito:{$lte: body.budget}
        },{
          title: {$ilike: body.where+"%"} 
        });
    }else if (body.travel == "corporativo"){
        query.push({
          corporate:{$lte: body.budget}
        },{
          title: {$ilike: body.where+"%"} 
        });
    }
    return query;
  }
  
  traveltype(body.travel);
  if (!body.where){
    query.splice(1, 1);;
  }
  
  db.Country.findAll({ where: {
      $or: query
     } 
   }).then(function(countries){
    info = [];
    for (var i = 0; i < countries.length; i++){
      
      info.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [countries[i].long,countries[i].lat]
            },
            properties: {
              title: countries[i].title,
              description: countries[i].text,
              corporate: countries[i].corporate,
              url: countries[i].url,
              incognito: countries[i].incognito,
              vip: countries[i].vip,
              cover: countries[i].cover,
              version: countries[i].version,
              "marker-color": "#6ae9d7",
              "marker-size": "large",
              "marker-symbol": "circle"
            } 
      });
    }
    var json = JSON.stringify(info);
      
    res.write(json);
    res.end();
  });
});

router.get('/blog', function (req, res, next) {
  var filter = req.query.filter, art = [];
  if (filter){
    db.Article.findAll().then(function (articles) {
      for(var i = 0; i < articles.length; i++){
        if (articles[i].category.indexOf(filter) >= 0){
          art.push(articles[i]);
        }
      }
      res.render('blog', {
        title: 'blog',
        articles: art,
        logo: "group-2.png",
        cloudinary_account: process.env.CLOUDINARY_NAME
      });
    });
    
  }else{
  
    db.Article.findAll().then(function (articles) {
      res.render('blog', {
        title: 'blog',
        articles: articles,
        logo: "group-2.png",
        cloudinary_account: process.env.CLOUDINARY_NAME
      });
    });
    
  }
  
});

router.post('/email_country', function (req, res, next) {
  var body = req.body;
  db.Client.create({ mail: body.email, country: body.country, experience: body.travel  }).then(function () {
    res.sendStatus(200);
    res.end();
    
    var mailOptions = {
        from: '"arams" <hola@arams.com.co>', // sender address
        to: 'sensaciones@arams.com.co', // list of receivers
        subject: 'Nuevo contacto 👥', // Subject line
        text: 'Correo: ' + body.email + '/n País: ' + body.country + '/n Tipo de viaje: ' + body.travel, // plaintext body
        html: '📩 <b>Correo:</b> ' + body.email + '<br /> <b>País:</b> ' + body.country + '<br /> 💵 <b>Tipo de viaje:</b> ' + body.travel// html body
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
    
  });
});

router.get('/admin/clients', notify, authorize, function (req, res, next) {
  db.Client.findAll({where:{flag: 0}}).then(function (clients) {
    res.render('admin_clients', {
      title: 'Interesados',
      clients: clients,
      user: req.session.user,
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      logo: "group-2.png",
      admin_clients: "active"
    });
  });
});

router.post('/send_contact', function (req, res, next) {
  var body = req.body;
  db.Client.create({ name: body.name, mail: body.email, country: body.country, experience: body.travel, subject: body.subject, message: body.message, flag: 1 }).then(function () {
    res.render('contact', {
      title: 'Contacto',
      success: "Su mensaje ha sido enviado correctamente",
      logo: "group-2.png"
    });
    
    var mailOptions = {
        from: '"Maria bahamon" <info@mariabahamon.com>', // sender address
        to: 'hola@fabiarnios.co', // list of receivers
        subject: 'Nuevo contacto 👥', // Subject line
        text: ' Nombre: ' + body.name + ' Correo: ' + body.email + ' Asunto: ' + body.subject + ' Mensaje: ' + body.message, // plaintext body
        html: ' 🐴 <b>Nombre:</b> ' + body.name + '<br /> 📩 <b>Correo:</b> ' + body.email + '<br /> 📨 <b>Asunto:</b> ' + body.subject + 'Mensaje: ' + body.message // html body
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
    
  });
});

router.get('/admin/contact', notify, authorize, function (req, res, next) {
  db.Client.findAll({where:{flag: 1},order:'name DESC'}).then(function (clients) {
    res.render('admin_contact', {
      title: 'Contactos',
      clients: clients,
      user: req.session.user,
      logo: "group-2.png",
      admin_contacts: "active",
      qty: req.session.clients,
      qty_contacts: req.session.contacts
    });
  });
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {
      title: 'Contacto',
      logo: "group-2.png"
    });
});


router.get('/admin/articles', notify, authorize, function (req, res, next) {
  db.Article.findAll().then(function (articles) {
    res.render('admin_articles', {
      title: 'Admin articles',
      articles: articles,
      user: req.session.user,
      logo: "group-2.png",
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      admin_articles: "active",
      cloudinary_account: process.env.CLOUDINARY_NAME
    });
  });
});


router.get('/article/create', notify, authorize, function (req, res, next) {
    res.render('create', {
      title: 'Crear nuevo articulo',
      logo: "group-2.png",
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      user: req.session.user,
      admin_articles: "active"
    });
});


router.get('/quienes_somos', function (req, res, next) {
    res.render('quienes_somos', {
      title: 'Quienes somos',
      logo: "group-2.png"
    });
});

router.get('/servicios', function (req, res, next) {
    res.render('servicios', {
      title: 'Servicios',
      logo: "group-2.png"
    });
});

 
router.get('/article/:id', function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    article.getCovers().then(function(associatedCovers) {
      article.getUser().then(function(user) {
    
      res.locals = {
        pageTitle: "articles",
        background: true,
        logo: "group-2.png",
        cloudinary_account: process.env.CLOUDINARY_NAME
      };
    
      res.render('show', {
        title: article.title,
        article: article,
        logo: "logo_white.png",
        covers: associatedCovers, 
        author: user,
        cloudinary_account: process.env.CLOUDINARY_NAME
      });
    
      });
    
    });
    
  });
});



router.get('/article/:id/edit', notify, authorize, function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    article.getCovers().then(function(associatedCovers) {
      res.render('edit', {
        title: "Edición",
        article: article,
        logo: "group-2.png",
        qty: req.session.clients,
        qty_contacts: req.session.contacts,
        covers: associatedCovers, 
        user: req.session.user,
        cloudinary_account: process.env.CLOUDINARY_NAME
      });
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

router.post('/delete_image', function (req, res, next) {
  var body = req.body;
  cloudinary.api.delete_resources(body.public_id,function(result){
     db.Cover.destroy({
      where: {
        public_id: body.public_id
      }
    }).then(function() {
      res.redirect('/article/'+body.article_id+'/edit');
    });
  });
});

function upload_multiple(files, id){
  // console.log(files, files.length);
  if (files.length <= 0){return}
  for (var i = 0; i < files.length; i++) {
      cloudinary.uploader.upload(files[i].path, function(result) {
        var version = result.version.toString();
        var pid = result.public_id.toString();
          db.Cover.findOrCreate({where: {
              version: version,
              ArticleId: id, 
              orden: 0,
              public_id:pid,
              home: false
          }});
      });
  }
  return;
}

var cpUpload = upload.fields([{ name: 'image_upload', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]);
router.post('/articles',cpUpload, function (req, res, next) {
  var body = req.body;
  var urlbody = friendlyUrl(body.title);
  var files = req.files;
  if(typeof req.files !== 'undefined' && typeof req.files['image_upload'] !== 'undefined'){
    cloudinary.uploader.upload(req.files['image_upload'][0].path, function(result) {
      db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate, UserId: body.user || 1 }).then(function (article) {
        var id = article.id
        if(req.files['gallery']){
         upload_multiple(req.files['gallery'], id);
        }
       res.redirect('/admin/articles');
      });
    });
  }else{
    db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, vip: body.vip, incognito: body.incognito, corporate: body.corporate, UserId: body.user || 1 }).then(function (article) {
      var id = article.id
      if(req.files['gallery']){
       upload_multiple(req.files['gallery'], id);
      }
     res.redirect('/admin/articles');
    });
  }
});

router.post('/article/:id/editar', notify, authorize, cpUpload, function (req, res, next) {
  var id = req.params.id
  var body = req.body
  var urlbody = friendlyUrl(body.title);
  var files = req.files;
  if(req.files['gallery']){
   upload_multiple(req.files['gallery'], id);
  }
  db.Article.findById(id).then(function (article) {
    if(typeof req.files !== 'undefined' && typeof req.files['image_upload'] !== 'undefined'){
    cloudinary.uploader.upload(req.files['image_upload'][0].path, function(result) {
      article.update({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate,  UserId: body.user || 1 }).then(function(){
       res.redirect('/admin/articles');
      });
    },{ public_id: article.cover_version, invalidate: true });
    } else{
      article.update({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, vip: body.vip, incognito: body.incognito, corporate: body.corporate, UserId: body.user || 1}).then(function () {
       res.redirect('/admin/articles');
      });
    }
  });
});

function upload_home(files){
  if (files.length <= 0){return}
  for (var i = 0; i < files.length; i++) {
      cloudinary.uploader.upload(files[i].path, function(result) {
        var version = result.version.toString();
        var pid = result.public_id.toString();
          db.Cover.findOrCreate({where: {
              version: version,
              orden: i,
              public_id:pid,
              home: true
          }});
      });
  }
  return;
}


router.post('/home_gallery', notify, authorize, cpUpload, function (req, res, next) {
  var body = req.body
  var files = req.files;
  if(files['gallery']){
   upload_home(files['gallery'], 0);
   res.redirect('/admin/users');
  }
});


router.get('/article/:id/destroy', notify, authorize, function (req, res, next) {
  db.Article.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.redirect('/admin/articles');
    });
});



router.post('/edit_user', notify, authorize, upload.single('image_upload'), function (req, res, next) {
  var body = req.body;
  var file = req.file;
  if(!file){
  db.User.findById(body.id).then(function (user) {
    if (body.password){
      user.update({ username: body.username, email: body.email, password: encrypt(body.password), name: body.name }).then(function () {
       res.redirect('/admin/users');
      });
    }else{
      user.update({ username: body.username, email: body.email, name: body.name}).then(function () {
       res.redirect('/admin/users');
      });
    }
  });
  }else if(file){
  db.User.findById(body.id).then(function (user) {
    if (user.version){
    cloudinary.uploader.upload(file.path, function(result) {
      user.update({ username: body.username, email: body.email, image: result.public_id, version: result.version, name: body.name}).then(function () {
       res.redirect('/admin/users');
      });
    },{ public_id: user.version, invalidate: true });
    }else{
      cloudinary.uploader.upload(file.path, function(result) {
        user.update({ username: body.username, email: body.email, image: result.public_id, version: result.version, name: body.name}).then(function () {
         res.redirect('/admin/users');
        });
      });
    }
  }); 
  }else{
    res.render('admin_users', {
      title: 'Mi perfil',
      logo: "group-2.png",
      error: "Revise los campos ni la contraseña ni el nombre de usuario pueden estar vacios",
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      user: req.session.user,
      cloudinary_account: process.env.CLOUDINARY_NAME
    });
  }
});

router.post('/create_user', notify, authorize, upload.single('image_upload'), function (req, res, next) {
  var body = req.body;
  var file = req.file;
  if(file){
    cloudinary.uploader.upload(file.path, function(result) {
      db.User.create({ username: body.username, email: body.email, image: result.public_id, version: result.version, name: body.name, password: encrypt(body.password), admin:true}).then(function () {
       res.redirect('/admin/users');
      });
    });
  }
  else{
    db.User.create({ username: body.username, email: body.email, name: body.name, password: encrypt(body.password), admin:true}).then(function () {
     res.redirect('/admin/users');
    });
  }
});


router.get('/admin/users', notify, authorize, function (req, res, next) {
   db.User.findAll().then(function (users) {
     db.Cover.findAll({where:{home: true}}).then(function (covers) {
       
       res.render('admin_users', {
         title: 'Mi perfil',
         logo: "group-2.png",
         user: req.session.user,
         qty: req.session.clients,
         qty_contacts: req.session.contacts,
         covers: covers,
         users: users,
         cloudinary_account: process.env.CLOUDINARY_NAME
       });
       
     });
  });  
});

router.get('/covers', function (req, res, next) {
  db.Cover.findAll({where:{home: true}}).then(function (covers) {
    var return_data = {
        covers: covers,
        remote: true
    };
    res.write(JSON.stringify(return_data));
    res.end();
  });
});


