var express = require('express'),
  router = express.Router(),
  db = require('../models');

var fs = require('fs');
var multer = require('multer');
var upload = multer({dest:'./img/uploads/'});
var friendlyUrl = require('friendly-url');
var cloudinary = require('cloudinary');
var dateFormat = require('dateformat');
var nodemailer = require('nodemailer');
var moment = require('moment-timezone');
// console.log(moment.tz.names());

var calendar = function(req, res, next) {
  db.Event.findAll().then(function (events) {
    req.events = events;
    return next();
  })
};

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
        logo: "logo.png",
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
//
// var AWS_ACCESS_KEY =  process.env.S3_ACCESS_KEY;
// var AWS_SECRET_KEY =process.env.S3_SECRET_ACCESS_KEY;
// var S3_BUCKET = process.env.S3_BUCKET_NAME;

module.exports = function (app) {
  app.use('/', router);
};


router.get('/', calendar, function (req, res, next) {
    //console.log("req.events",req.events);
    res.locals = {
      pageTitle: "form",
      background: true,
      logo: "logo.png",
      bg: "../img/bg1.jpg",
      home: true,
      cloudinary_account: process.env.CLOUDINARY_NAME
    };
    res.render('index', {
      experiences: true,
      title: 'home',
			layout: 'home'
    });
});


router.get(['/login', '/admin'], function (req, res, next) {
    res.render('login', {
      title: 'Inicio de sesión',
      logo: "logo.png",
      layout: "login", 
      query: true
    });
});

router.post('/login', function (req, res, next) {
  // console.log("pass", decrypt(req.body.password));
  if (!req.body.username || !req.body.password){
    return res.render('login',{
       error: 'los campos no pueden estar vacios',
       title: 'Inicio de sesión',
       logo: "logo.png"
    });
  }
  db.User.findOne({ where: {username: req.body.username, password: encrypt(req.body.password)} }).then(function(user) {
    
    if (!user) {
      return res.render("login", {
         error: "No se encontro nadie con esas credenciales.",
         title: "Inicio de sesión",
         logo: "logo.png" 
      });
    }
    
    req.session.user = user; 
    req.session.admin = user.admin;
    var url = req.url;
    res.redirect('/admin/events');
    
  });
});

router.get('/logout', function (req, res, next) {
   req.session.destroy(); 
   res.redirect('/');
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
        logo: "logo.png",
        cloudinary_account: process.env.CLOUDINARY_NAME
      });
    });
    
  }else{
  
    db.Article.findAll().then(function (articles) {
      res.render('blog', {
        title: 'blog',
        articles: articles,
        logo: "logo.png",
        cloudinary_account: process.env.CLOUDINARY_NAME
      });
    });
    
  }
  
});


router.get('/admin/clients', notify, authorize, function (req, res, next) {
  db.Client.findAll({where:{flag: 0}}).then(function (clients) {
    res.render('admin_clients', {
      title: 'Interesados',
      clients: clients,
      user: req.session.user,
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      layout: "admin",
      logo: "logo.png",
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
      logo: "logo.png"
    });
    
    var mailOptions = {
        from: '"Maria bahamon" <info@mariabahamon.com>', // sender address
        to: process.env.MAINEMAIL, // list of receivers
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
      logo: "logo.png",
      admin_contacts: "active",
      qty: req.session.clients,
      layout: "admin",
      qty_contacts: req.session.contacts
    });
  });
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {
      title: 'Contacto',
      logo: "logo.png"
    });
});


router.get('/admin/articles', notify, authorize, function (req, res, next) {
  db.Article.findAll().then(function (articles) {
    res.render('admin_articles', {
      title: 'Admin articles',
      articles: articles,
      user: req.session.user,
      logo: "logo.png",
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      admin_articles: "active",
      layout: "admin",
      cloudinary_account: process.env.CLOUDINARY_NAME
    });
  });
});


router.get('/article/create', notify, authorize, function (req, res, next) {
    res.render('create', {
      title: 'Crear nuevo articulo',
      logo: "logo.png",
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      user: req.session.user,
      admin_articles: "active",
      layout: "admin"
    });
});


router.get('/quienes_somos', function (req, res, next) {
    res.render('quienes_somos', {
      title: 'Quienes somos',
      logo: "logo.png"
    });
});

router.get('/bahamon', function (req, res, next) {
    res.render('bahamon', {
      title: 'Dr. María Bahamón',
      logo: "logo.png"
    });
});


router.get('/tratamientos', function (req, res, next) {
    res.render('servicios', {
      title: 'Tratamientos',
      logo: "logo.png"
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
        logo: "logo.png",
        cloudinary_account: process.env.CLOUDINARY_NAME
      };
    
      res.render('show', {
        title: article.title,
        article: article,
        logo: "logo.png",
        covers: associatedCovers, 
        author: user,
				layout: "main",
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
        logo: "logo.png",
        qty: req.session.clients,
        qty_contacts: req.session.contacts,
        covers: associatedCovers, 
        user: req.session.user,
				layout: "admin",
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

router.post('/events', function (req, res, next) {
  var body = req.body;
  console.log("body: ", body);
  db.Event.findAll().then(function (events) {
    
    var invalidEntries = 0;
    var preexisting = false;
    
    var futura = 0;
    var lipo = 0;
    function filterByID(obj) {
      // console.log(moment(obj.when).format("lll"), moment(body.time).format("lll"));
      if (moment(obj.when).format("lll") == moment(body.time).format("lll")) {
        if(obj.category == "futura" && body.category == "futura"){
          futura++
        }
        if(obj.category == "lipomax" && body.category == "lipomax"){
          lipo++
        }
        console.log("lipo",lipo, moment(obj.when).format("lll"), obj.category, body.category);
        if (obj.category == "futura" && futura < 2){
          return false;
        }else if(obj.category == "lipomax" && lipo < 3){
          return false;
        }else if(obj.category == body.category){
          preexisting = true;
          return true;
        }else{
          return false;
        }
      } else {
        invalidEntries++;
        return false;
      }
    }
    var arrByID = events.filter(filterByID);
    console.log(preexisting);
    // db.Event.destroy({}).then(function() {
    //   res.redirect('/');
    // });
    //console.log(arrByID, invalidEntries);
    if(!preexisting){
      db.Event.create({ name: body.name, category: body.category, email: body.email, phone: body.phone, when: body.time, publish: body.publish }).then(function (response) {
        //console.log("data", response["dataValues"]);
        res.write(JSON.stringify(response["dataValues"],{"success":"El evento fue creado"}));
        // console.log('mariabahamoncon@gmail.com, '+body.email);
        if(body.recibir){
          var cita = body.publish ? "presencial" : "virtual";
          var address = {
              from: '"Maria bahamon" <mariabahamoncon@gmail.com>', // sender address //
              to: process.env.MAINEMAIL+', '+body.email, // list of receivers
              subject: 'Nueva cita 👥', // Subject line
              text: ' Nombre: ' + body.name + ' Correo: ' + body.email + ' Asunto: ' + body.category + ' Cel: ' + body.phone+ ' Tipo: ' + cita+ ' Cuando: ' + body.time, 
              html: "Tu cita "  + cita + " para el " +moment.tz(body.time, "GMT+0").format("L")+" "+moment.tz(body.time, "GMT+0").format("LTS")+  " ha sido agendada, nuestro personal se comunicará contigo en las próximas horas."
          };
    
          transporter.sendMail(address, function(error, info){
              if(error){
                  return console.log(error);
              }
              console.log('Message sent: ' + info.response);
          });
          
        }
        res.end();
      });
    }else{
      res.status(500);
      res.write(JSON.stringify({"error":"ya existe"}));
      res.end();
    }
    
  });
  
});

router.get('/events', function (req, res, next) {
  db.Event.findAll({ publish: true }).then(function (events) {
    res.write(JSON.stringify(events));
    res.end();
  });
});

router.get('/events/:cat/:date', function (req, res, next) {
  var cat = req.params.cat
  var date = req.params.date
  console.log("params: ", cat, date);
  var to_remove = {hours:[]};
  db.Event.findAll({ where:{publish: true}}).then(function (events) {
    for(var i = 0; i < events.length; i++){
      // console.log(moment(events[i].dataValues.when).format("MM-DD-YYYY"));
      if(moment(events[i].dataValues.when).format("MM-DD-YYYY") == date){
        var ese = moment.tz(events[i].dataValues.when, "America/Bogota");
        ese = moment(ese).format("H:mm").toString();
        if (events[i].dataValues.category == cat && events[i].dataValues.category == "lipomax"){
         console.log("lipo");
         if (to_remove.hasOwnProperty(ese)){
           to_remove[ese].qt++
           if(to_remove[ese].qt >= 2){
             to_remove["hours"].push(ese);
           }
         }else{
           to_remove[ese] = {qt: 0}
         }
        }else if(events[i].category == cat && events[i].category == "futura"){
          console.log("futura");
          if (to_remove.hasOwnProperty(ese)){
            to_remove[ese].qt++
            if(to_remove[ese].qt >= 1){
              to_remove["hours"].push(ese);
            }
          }else{
            to_remove[ese] = {qt: 0}
          }
        }else if(events[i].category == cat ){
          to_remove["hours"].push(ese);
        }
      }
    }
    
    
    
    res.write(JSON.stringify(to_remove));
    res.end();
  });
});


router.get('/event/:id/delete', notify, authorize, function (req, res, next) {
  db.Event.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.redirect('/admin/events');
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


router.get('/delete_contact/:id/destroy', notify, authorize, function (req, res, next) {
  db.Client.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.redirect('/admin/contact');
    });
});

router.get('/export', notify, authorize, function (req, res, next) {
  db.Client.findAll({}).then(function(clients) {
    var header="Nombre"+"\t"+" Mail"+"\t"+" Asunto"+"\t"+" Mensaje"+"\n";
    var rows = "";
    for (var key in clients){
      if(clients[key].dataValues && clients[key].dataValues.message)
        rows = rows+= clients[key].dataValues.name+"\t"+clients[key].dataValues.mail+"\t"+clients[key].dataValues.subject+"\t"+clients[key].dataValues.message.replace(/(\r\n|\n|\r)/gm,"")+"\n";
    }
    
    res.attachment('public/contactos.xls');
    var c = header + rows;
    return res.send(c);
    });
});


function upload_multiple(files, id){
  console.log("aca ", files, files.length, files[0].path,  id);
  if (files.length <= 0){return}
      cloudinary.uploader.upload(files[0].path, function(result) {
        var version = typeof result.version != "undefined" ? result.version.toString() : "";
        var pid = result.public_id.toString();
          db.Cover.findOrCreate({where: {
              version: version,
              ArticleId: id,
              orden: 0,
              public_id:pid,
              home: false
          }});
      });
  return;
}

var cpUpload = upload.fields([{ name: 'image_upload', maxCount: 1 }, { name: 'first_upload', maxCount: 1 }, { name: 'last_upload', maxCount: 1 }]);
router.post('/articles',cpUpload, function (req, res, next) {
  var body = req.body;
  var urlbody = friendlyUrl(body.title);
  var files = req.files;
  if(typeof req.files !== 'undefined' && typeof req.files['image_upload'] !== 'undefined'){
    cloudinary.uploader.upload(req.files['image_upload'][0].path, function(result) {
      db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate, UserId: body.user || 1 }).then(function (article) {
        var id = article.id
        if(req.files['first_upload']){
         upload_multiple(req.files['first_upload'], id);
        }
        if(req.files['last_upload']){
         upload_multiple(req.files['last_upload'], id);
        }
       res.redirect('/admin/articles');
      });
    });
  }else{
    db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, vip: body.vip, incognito: body.incognito, corporate: body.corporate, UserId: body.user || 1 }).then(function (article) {
      var id = article.id
      if(req.files['first_upload']){
       upload_multiple(req.files['first_upload'], id);
      }
      if(req.files['last_upload']){
       upload_multiple(req.files['last_upload'], id);
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
  if(req.files['first_upload']){
   upload_multiple(req.files['first_upload'], id);
  }
  if(req.files['last_upload']){
   upload_multiple(req.files['last_upload'], id);
  }
  db.Article.findById(id).then(function (article) {
    if(typeof req.files !== 'undefined' && typeof req.files['image_upload'] !== 'undefined'){
    cloudinary.uploader.upload(req.files['image_upload'][0].path, function(result) {
      article.update({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate,  UserId: body.user || 1 }).then(function(){
			 console.log("updated");
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

// function upload_home(files){
//   if (files.length <= 0){return}
//   for (var i = 0; i < files.length; i++) {
//       cloudinary.uploader.upload(files[i].path, function(result) {
//         var version = result.version.toString();
//         var pid = result.public_id.toString();
//           db.Cover.findOrCreate({where: {
//               version: version,
//               orden: i,
//               public_id:pid,
//               home: true
//           }});
//       });
//   }
//   return;
// }


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
      logo: "logo.png",
      error: "Revise los campos ni la contraseña ni el nombre de usuario pueden estar vacios",
      qty: req.session.clients,
      qty_contacts: req.session.contacts,
      user: req.session.user,
      admin_users:"active",
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
         logo: "logo.png",
         user: req.session.user,
         qty: req.session.clients,
         qty_contacts: req.session.contacts,
         covers: covers,
         admin_users:"active",
         users: users,
         layout: "admin",
         cloudinary_account: process.env.CLOUDINARY_NAME
       });
       
     });
  });  
});

router.get('/admin/events', notify, authorize, function (req, res, next) {
  res.render('admin_events', {
    title: 'Citas',
    user: req.session.user,
    qty: req.session.clients,
    admin_events: "active",
    layout: "admin",
    cloudinary_account: process.env.CLOUDINARY_NAME
  });
});

router.get('/admin/tools', notify, authorize, function (req, res, next) {
  res.render('admin_tools', {
    title: 'Herramientas',
    user: req.session.user,
    qty: req.session.clients,
    admin_tools: "active",
    layout: "admin",
    cloudinary_account: process.env.CLOUDINARY_NAME
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


