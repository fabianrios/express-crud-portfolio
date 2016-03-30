(function() {
  $(document).foundation();
  if ($("#fulltext").length){
    CKEDITOR.replace( 'fulltext' ); 
  }
     
  $('#like').click(function(e){
    e.preventDefault();
    $id = $(this).attr("data-id");
    $.post('like/', { 'id': $id }, function(data){
      $("#increment").html(data);
    });
  });
     
  if(document.getElementById("map")){
    // travel info selected travel dinamically
    var travel = $("#travel-info").data("travel");
    $("#travel").val(travel);
    
    L.mapbox.accessToken = 'pk.eyJ1IjoiZmFiaWFucmlvcyIsImEiOiJjaWc3ZDFhMjMwczFvdjRrcHF4bXliMzNoIn0.PTi-JKyYhEaQknlR6iGCoA';
    var map = L.mapbox.map('map')
    .setView([0, 0], 3);
    
    var info = document.getElementById('info');
    var know = $(".inline-form #know").val(), budget = $(".inline-form #budget").val(), travel = $(".inline-form #travel").val(), where = $(".inline-form #where").val();
    // Use styleLayer to add a Mapbox style created in Mapbox Studio
    L.mapbox.styleLayer('mapbox://styles/fabianrios/cikqb97u2001qaplyggo25dgu').addTo(map);
    
    $.get('/countries_all?know='+know+'&budget='+budget+'&travel='+travel+'&where='+where, function(data){
      data = JSON.parse(data);
      var myLayer = L.mapbox.featureLayer().addTo(map);
      myLayer.setGeoJSON(data);
      myLayer.on('click',function(e) {
          // Force the popup closed.
          e.layer.closePopup();
          var feature = e.layer.feature;
          var content = '<div class="country-post"><img src="http://res.cloudinary.com/fabianrios/image/upload/c_fill,h_275,w_400/v'+feature.properties.version+'/'+feature.properties.cover+'.jpg" /><div class="gradientbg"><h4 class="title-map whitetxt">' + feature.properties.title + '</h4><h6 class="whitetxt price-map"><span class="cur">' + feature.properties.corporate + '</span> a <span class="cur">' + feature.properties.vip + '</span></h6></div><div class="content"><p class="nm">' + feature.properties.description + '</p></div><a target="_blank" href="' + feature.properties.url + '" class="blog">BLOG</a><a target="_blank" href="' + feature.properties.url + '/#comments" class="blog">COMENTARIOS</a><form action="/email_country" method="post" class="inliner" id="email_country" ><input type="email" name="email" class="unflashy" placeholder="Correo Electrónico" required/><i class="fa fa-envelope fix-inline"></i><input type="submit" value="ENVIARME MAS INFO" class="button full success" /></form><a class="ferme"><span>X</span></a></div>';
          info.innerHTML = content;
          $(".cur").autoNumeric('init',{
            aSep: '.',
            aDec: ',', 
            aSign: '$ ',
            mDec: '0'
          });
      });
      
    });
    
    map.scrollWheelZoom.disable();
  }
     
  $(".currency").autoNumeric('init',{
    aSep: '.',
    aDec: ',', 
    aSign: 'US$ ',
    mDec: '0'
  });
  
  $(".cur").autoNumeric('init',{
    aSep: '.',
    aDec: ',', 
    aSign: '$ ',
    mDec: '0'
  });
  
  $(document).on('click', '.ferme',function(e) { 
    e.preventDefault();
    $(this).parent().html("");
  });
  
  
  $("#info, .quick-contact").on('submit','#email_country', function(evemt){
        event.preventDefault();
        var $form = $(this), email = $form.find( "input[name='email']" ).val(), travel = $form.find( "input[name='travel']" ).val(), country = $form.find( "input[name='country']" ).val(), url = $form.attr( "action" );
        $.post(url, { email: email, country: country, travel: travel }, function(resp) {
            if (resp == "OK"){
              $form.find(".fa").removeClass("fa-envelope").addClass("fa-check").css({"color":"#70e8d7"});
              $(".envelope").css({"background":"#70e8d7"});
            }else{
              $form.find(".fa").removeClass("fa-envelope").addClass("fa-times").css({"color":"rgb(255,85,0)"});
            }
        });
    });
  
  $('.inline-form form').submit(function(e){
    var know = $(".inline-form #know").val(), budget = $(".inline-form #budget").val(), travel = $(".inline-form #travel").val(), where = $(".inline-form #where").val();
    
    $.get('/countries_all?know='+know+'&budget='+budget+'&travel='+travel+'&where='+where, function(data){
      data = JSON.parse(data);
      var myLayer = L.mapbox.featureLayer().addTo(map);
      myLayer.setGeoJSON(data);
      myLayer.on('click',function(e){
          e.layer.closePopup();
          var feature = e.layer.feature;
          var content = '<div class="country-post"><img src="http://res.cloudinary.com/fabianrios/image/upload/c_fill,h_275,w_400/v'+feature.properties.version+'/'+feature.properties.cover+'.jpg" /><div class="gradientbg"><h4 class="title-map whitetxt">' + feature.properties.title + '</h4><h6 class="whitetxt price-map"><span class="cur">' + feature.properties.corporate + '</span> a <span class="cur">' + feature.properties.vip + '</span></h6></div><div class="content"><p class="nm">' + feature.properties.description + '</p></div><a target="_blank" href="' + feature.properties.url + '" class="blog">BLOG</a><a target="_blank" href="' + feature.properties.url + '/#comments" class="blog">COMENTARIOS</a><form action="/email_country" method="post" class="inliner" id="email_country" ><input type="email" name="email" class="unflashy" placeholder="Correo Electrónico" required/><i class="fa fa-envelope fix-inline"></i><input type="submit" value="ENVIARME MAS INFO" class="button full success" /></form><a class="ferme"><span>X</span></a></div>';
          info.innerHTML = content;
          $(".cur").autoNumeric('init',{
            aSep: '.',
            aDec: ',', 
            aSign: '$ ',
            mDec: '0'
          });
          
      });
    });
  });
  
  $('input#budget, input#email').bind("change keyup input",function() { 
     var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
     if ($.isNumeric(this.value) || pattern.test(this.value)) {
       $(".check").css({"background":"#70e8d7"});
       var valor = $("#know").val();
       if (valor == "no"){
         $(".plane").css({"background":"#70e8d7"});
       }
      }else if(this.value == ""){
        $(".check").css({"background":"rgba(0,0,0,.3)"});
      }
  });
  
  $("#travel").change(function(e){
    var val = $(this).val();
    if (val != ""){
      $(".envelope").css({"background":"#70e8d7"});
    }else{
      $(".envelope").css({"background":"rgba(0,0,0,.3)"});
    }
  });
  
  $('#articles-form').submit(function(){
    var form = $(this);
    $('input').each(function(i){
      var self = $(this);
      try{
        var v = self.autoNumeric('get');
        self.autoNumeric('destroy');
        self.val(v);
      }catch(err){
        console.log("Not an autonumeric field: " + self.attr("name"));
      }
    });
    return true;
  });
  
  $("#country-search").keyup(function(event) {
    var str = $(this).val().toLowerCase();
    $("ul.country li").hide();
    $("ul.country li h5.country-names").each(function( index ) {
      var txt = $(this).text().toLowerCase();
      if (txt.indexOf(str) >= 0){
        $(this).parent().show();
      }
    });
  });
 
  function now(){
    var valor = $("#know").val();
    if (valor == "si"){
      $("#where").show();
      $(".inline-form #budget").attr('name','email').attr('placeholder','Correo electronico').attr('id','email').attr('type','email').val("");
      $(".inline-form #btn-input").attr('value','RECIBIR INFORMACION');
      $(".inline-form #know").css({"max-width":"28%","display":"inline-block"});
      $(".inline-form #where").css({"max-width":"68%","display":"inline-block"});
      $(".plane").css({"background":"#70e8d7"});
    }else{
      $("#where").val("").hide();
      $(".inline-form #email, .inline-form #budget").attr('name','budget').attr('placeholder','¿Que presupuesto tienes?').attr('id','budget').attr('type','text').val("");
      $(".inline-form #btn-input").attr('value','VER LISTA DE PAISES');
      $(".plane").css({"background":"rgba(0,0,0,.3)"});
    }
  }
  
  $("#know").change(function(e){
    var val = $(this).val();
    if (val == "si"){
      $("#where").show();
      $("#budget").attr('name','email').attr('placeholder','Correo electronico').attr('id','email').attr('type','email').val("");
      $("#btn-input").attr('value','RECIBIR INFORMACION');
      $(".plane").css({"background":"#70e8d7"});
      $(".inline-form #know").css({"max-width":"28%","display":"inline-block"});
      $(".inline-form #where").css({"max-width":"68%","display":"inline-block"});
    }else{
      $("#where").val("").hide();
      $("#email").attr('name','budget').attr('placeholder','¿Que presupuesto tienes?').attr('id','budget').attr('type','text').val("");
      $("#btn-input").attr('value','VER LISTA DE PAISES');
      $(".plane").css({"background":"rgba(0,0,0,.3)"});
      $(".inline-form #know").css({"max-width":"100%","display":"inline-block"});
    }
  });
  
  now();
  
  $(".close").click(function(e){
    e.preventDefault();
    $(".alert-box").remove();
  });
  
  var indirect = {
    remote: false
  };
  function get_covers(){
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/covers");
      xhr.onreadystatechange = function(){
          if(xhr.readyState === 4){
              if(xhr.status === 200){
                  indirect = JSON.parse(xhr.responseText);
              }
              else{
                  console.log("Could not get the covers.");
                  indirect.remote = false;
              }
          }
      };
      xhr.send();
  }
  get_covers();
  
  function excitement(){
    $('.navigation, .social').css({"display":"inline-block"});
    
    var img_array = [1, 2, 3];
    var index = 0;
    var interval = 10000;
    setInterval(function() {
      $(".alert-box").remove();
      $('.bg-gradient, .bg-grad').animate({
        backgroundColor: 'rgba(0, 88, 160, 0)'
      }, 1000);

      var image = $('.main-body.home');  
      if (indirect.covers.length > 0){
       console.log("indirect.covers", indirect.covers, index++ % indirect.covers.length);
       image.css("background-image", "url('http://res.cloudinary.com/fabianrios/image/upload/v"+indirect.covers[index++ % indirect.covers.length].version+"/"+indirect.covers[index++ % indirect.covers.length].public_id+".jpg')"); 
      }else{
        image.css("background-image", "url('../img/bg" + img_array[index++ % img_array.length] + ".jpg')"); 
      }
      $('.bg-gradient, .bg-grad').delay(8000).animate({
        backgroundColor: 'rgba(0, 88, 160, .9)'
      }, 1000);
    }, interval);
  }
  
  if($(window).width() >= 1024) {
    excitement();
  }else if ($(window).width() <= 720){  // movil
    $('.navigation, .social').css({"display":"none"});
  }
  
   $(window).resize(function() {
        // This will fire each time the window is resized:
        if($(window).width() >= 1024) {
          
        }else if ($(window).width() <= 720){  // movil
          $('.navigation, .social').css({"display":"none"});
        }
    }).resize(); // This will simulate a resize to trigger the initial run.
  
  
    $('.home-form').submit(function(e){
      e.preventDefault();
      var url = "/info";
      var self = this;
      var know = $(this).children("#know").val(), email = $(this).children("#email").val(), budget = $(this).children("#budget").val(), travel = $(this).children("#travel").val(), where = $(this).children("#where").val();
      if($(window).width() >= 1024) {
        if(know == "no"){
          console.log("know ",know);
          self.submit();
        }else{
          $.post(url, { know: know, budget: budget, where: where, travel: travel, email: email },function(data){
            console.log("hasta aca: ",know, data);
            if(data == "success"){
              $(".fix-inl").show();
            }
          });
        }
      }else{
       
       // movil
        $.get('/countries_all?know='+know+'&budget='+budget+'&travel='+travel+'&where='+where, function(data){
          data = JSON.parse(data);
          var content = "";
          $.each(data, function(key, place){
            var coconuts = '<div class="country-post"><div class="prefix-img"><img src="http://res.cloudinary.com/fabianrios/image/upload/c_fill,h_275,w_400/v'+place.properties.version+'/'+place.properties.cover+'.jpg" /><div class="gradientbg"><h4 class="title-map whitetxt">' + place.properties.title + '</h4><h6 class="whitetxt price-map"><span class="cur">' + place.properties.corporate + '</span> a <span class="cur">' + place.properties.vip + '</span></h6></div></div><div class="content"><p class="nm">' + place.properties.description + '</p></div><a target="_blank" href="' + place.properties.url + '" class="blog">BLOG</a><a target="_blank" href="' + place.properties.url + '/#comments" class="blog">COMENTARIOS</a><form action="/email_country" method="post" class="inliner" id="email_country" ><input type="email" name="email" class="unflashy" placeholder="Correo Electrónico" required/><i class="fa fa-envelope fix-inline"></i><input type="submit" value="ENVIARME MAS INFO" class="button full success" /></form></div>'
            content = content + '<li class="accordion-navigation"><a class="accordion-title" href="#panel'+key+'">' + place.properties.title + '</a><div id="panel'+key+'" class="content">'+coconuts+'</div></li>';
          });
          $(".exp").css({"padding":"0"}).html('<ul class="accordion" data-accordion>'+content+'</ul>');
          // navigate to results
          $('html, body').animate({
                  scrollTop: $("#results").offset().top
              }, 1000);
          $(".accordion li a.accordion-title").click(function(){
            var href = $(this).attr("href");
            $(".cur").autoNumeric('init',{
              aSep: '.',
              aDec: ',', 
              aSign: '$ ',
              mDec: '0'
            });
            $(".content").removeClass("active");
            $(href).addClass("active");
          });
        });
        
      }
      
    });
  
  if(document.getElementById("category-val")){
    var cat = $("#category-val").data("category");
    $.each(cat.split(","), function(i,e){
        $("#category option[value='" + e + "']").prop("selected", true);
    });
  }

  $('table').DataTable({
      "language": {
          "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Spanish.json"
      }
  });
  
  if ($('.slider')){
    $('.slider').bxSlider({
       slideWidth: 200,
       minSlides: 5,
       moveSlides: 5,
       slideMargin: 1
     });
   }
   
   var modal = $('#modal');
   $(".slide a").click(function(e){
     e.preventDefault();
     var resp = '<img src="http://res.cloudinary.com/fabianrios/image/upload/c_fill,h_407,w_600/v'+$(this).data("version")+'/'+$(this).data("public_id")+'" alt="" />  <a class="close-reveal-modal" aria-label="Close">&#215;</a>'
     modal.html(resp).foundation('reveal', 'open');
   });
   
   $(window).scroll(function() {
      $(".footer-gallery").css({"bottom":"0"});
      if($(window).scrollTop() + $(window).height() == $(document).height()) {
        $(".footer-gallery").css({"bottom":"56px"});
      }
   });
   
   $(".xclose").click(function(e){
     e.preventDefault();
     $(this).children("span").toggleClass("fa-close");
     $(this).children("span").toggleClass("fa-bars");
     $(".navigation, .social").slideToggle();
   });
   
   var isiPhone = navigator.userAgent.toLowerCase().indexOf("iphone");
   var isAndroid = navigator.userAgent.toLowerCase().indexOf("android");
   if(isiPhone > -1 || isAndroid > -1){
     $('meta[name=viewport]').attr('content','width=device-width, user-scalable=no');
     $("#viewport").attr("content", "width=device-width, user-scalable=no");
   }		
   
  
})();
 
 