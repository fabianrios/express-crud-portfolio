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
  
  
  $("#info, .quick-contact").on('submit','#email_country', function(event){
        event.preventDefault();
        var $form = $(this), email = $form.find( "input[name='email']" ).val(), travel = $form.find( "input[name='travel']" ).val(), country = $form.find( "input[name='country']" ).val(), url = $form.attr( "action" );
        $.post(url, { email: email, country: country, travel: travel }, function(resp) {
            if (resp == "OK"){
              $form.find(".fa").removeClass("fa-envelope").addClass("fa-check").css({"color":"#70e8d7"});
              $(".envelope").css({"background":"#70e8d7"});
              $("#small-success").show();
            }else{
              $form.find(".fa").removeClass("fa-envelope").addClass("fa-times").css({"color":"rgb(255,85,0)"});
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

 
  
  
    $('.home-form').submit(function(e){
      e.preventDefault();
      var url = "/info";
      var self = this;
      var know = $(this).children("#know").val(), email = $(this).children("#email").val(), budget = $(this).children("#budget").val(), travel = $(this).children("#travel").val(), where = $(this).children("#where").val();
      if($(window).width() >= 1024) {
        if(know == "no"){
          self.submit();
        }else{
          $.post(url, { know: know, budget: budget, where: where, travel: travel, email: email },function(data){
            $(".fix-inl").show();
            $("#small-success").show();
            setTimeout(function(){ $(".alert-box").hide(); }, 4000);
          });
        }
      }else{
       
       // movil
        $.get('/countries_all?know='+know+'&budget='+budget+'&travel='+travel+'&where='+where, function(data){
          data = JSON.parse(data);
          var content = "";
          $.each(data, function(key, place){
            var coconuts = '<div class="country-post"><div class="prefix-img"><img src="http://res.cloudinary.com/aramsvip/image/upload/c_fill,h_275,w_400/v'+place.properties.version+'/'+place.properties.cover+'.jpg" /><div class="gradientbg"><h4 class="title-map whitetxt">' + place.properties.title + '</h4><h6 class="whitetxt price-map"><span class="cur">' + place.properties.corporate + '</span> a <span class="cur">' + place.properties.incognito + '</span></h6></div></div><div class="content"><p class="nm">' + place.properties.description + '</p></div><a target="_blank" href="' + place.properties.url + '" class="blog">BLOG</a><a target="_blank" href="' + place.properties.url + '/#comments" class="blog">COMENTARIOS</a><form action="/email_country" method="post" class="inliner" id="email_country" ><input type="email" name="email" class="unflashy" placeholder="Correo Electrónico" required/><i class="fa fa-envelope fix-inline"></i><input type="submit" value="ENVIARME MAS INFO" class="button full success" /></form></div>'
            content = content + '<li class="accordion-navigation"><a class="accordion-title" href="#panel'+key+'">' + place.properties.title + '</a><div id="panel'+key+'" class="content">'+coconuts+'</div></li>';
          });
          $("#results").html('<ul class="accordion" data-accordion>'+content+'</ul>');
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

  $('table#data').DataTable({
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
     var resp = '<img src="http://res.cloudinary.com/aramsvip/image/upload/c_fill,h_667,w_1000/v'+$(this).data("version")+'/'+$(this).data("public_id")+'" alt="" />  <a class="close-reveal-modal" aria-label="Close">&#215;</a>'
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
 
 