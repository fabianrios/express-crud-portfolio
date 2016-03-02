(function() {
  if ($("#fulltext").length){
    CKEDITOR.replace( 'fulltext' ); 
  }
     
  $('#like').click(function(e){
    e.preventDefault();
    $id = $(this).attr("data-id");
    console.log($id);
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
          var content = '<div class="country-post"><img src="http://res.cloudinary.com/fabianrios/image/upload/c_fill,h_275,w_400/v'+feature.properties.version+'/'+feature.properties.cover+'.jpg" /><div class="gradientbg"><h4 class="title-map whitetxt">' + feature.properties.title + '</h4><h6 class="whitetxt price-map">' + feature.properties.corporate + ' a ' + feature.properties.vip + '</h6></div><div class="content"><p class="nm">' + feature.properties.description + '</p></div><a href="' + feature.properties.url + '" class="blog">BLOG</a><form action="/email_country" method="post" class="inliner" id="email_country" ><input type="email" name="email" class="unflashy" placeholder="Correo Electrónico" required/><i class="fa fa-envelope fix-inline"></i><input type="submit" value="ENVIARME MAS INFO" class="button full success" /></form><a class="ferme"><span>X</span></a></div>';
          info.innerHTML = content;
      });
    });
    
    map.scrollWheelZoom.disable();
  }
     
  $(".currency").autoNumeric('init',{
    aSep: '.',
    aDec: ',', 
    aSign: 'US$ '
  });
  
  $(document).on('click', '.ferme',function(e) { 
    e.preventDefault();
    console.log("$(this)",$(this));
    $(this).parent().html("");
  });
  
  
  $("#info").on('submit','#email_country', function(evemt){
        event.preventDefault();
        var $form = $(this), email = $form.find( "input[name='email']" ).val(),url = $form.attr( "action" );
        $.post(url, { email: email }, function(resp) {
            if (resp == "OK"){
              $form.find(".fa").removeClass("fa-envelope").addClass("fa-check").css({"color":"#70e8d7"});
              $(".envelope").css({"background":"#70e8d7"});
            }else{
              $form.find(".fa").removeClass("fa-envelope").addClass("fa-times").css({"color":"rgb(255,85,0)"});
            }
        });
    });
  
  $('.inline-form form').submit(function(e){
    console.log($(this).children("#know"));
    var know = $(".inline-form #know").val(), budget = $(".inline-form #budget").val(), travel = $(".inline-form #travel").val(), where = $(".inline-form #where").val();
    
    $.get('/countries_all?know='+know+'&budget='+budget+'&travel='+travel+'&where='+where, function(data){
      data = JSON.parse(data);
      var myLayer = L.mapbox.featureLayer().addTo(map);
      myLayer.setGeoJSON(data);
      myLayer.on('click',function(e){
          e.layer.closePopup();
          var feature = e.layer.feature;
          var content = '<div class="country-post"><img src="http://res.cloudinary.com/fabianrios/image/upload/c_fill,h_275,w_400/v'+feature.properties.version+'/'+feature.properties.cover+'.jpg" /><div class="gradientbg"><h4 class="title-map whitetxt">' + feature.properties.title + '</h4><h6 class="whitetxt price-map">' + feature.properties.corporate + ' a ' + feature.properties.vip + '</h6></div><div class="content"><p class="nm">' + feature.properties.description + '</p></div><a href="' + feature.properties.url + '" class="blog">BLOG</a><form action="/email_country" method="post" class="inliner" id="email_country" ><input type="email" name="email" class="unflashy" placeholder="Correo Electrónico" required/><i class="fa fa-envelope fix-inline"></i><input type="submit" value="ENVIARME MAS INFO" class="button full success" /></form><a class="ferme"><span>X</span></a></div>';
          info.innerHTML = content;
      });
    });
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
    console.log(valor);
    if (valor == "si"){
      $("#where").show();
      $(".inline-form #know").css({"max-width":"28%","display":"inline-block"});
      $(".inline-form #where").css({"max-width":"68%","display":"inline-block"});
      $(".plane").css({"background":"#70e8d7"});
    }else{
      $("#where").val("").hide();
      $(".plane").css({"background":"rgba(0,0,0,.3)"});
    }
  }
  
  $("#know").change(function(e){
    var val = $(this).val();
    if (val == "si"){
      $("#where").show();
      $(".plane").css({"background":"#70e8d7"});
      $(".inline-form #know").css({"max-width":"28%","display":"inline-block"});
      $(".inline-form #where").css({"max-width":"68%","display":"inline-block"});
    }else{
      $("#where").val("").hide();
      $(".plane").css({"background":"rgba(0,0,0,.3)"});
      $(".inline-form #know").css({"max-width":"100%","display":"inline-block"});
    }
  });
  
  now();
  
})();
 
 