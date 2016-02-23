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
    L.mapbox.accessToken = 'pk.eyJ1IjoiZmFiaWFucmlvcyIsImEiOiJjaWc3ZDFhMjMwczFvdjRrcHF4bXliMzNoIn0.PTi-JKyYhEaQknlR6iGCoA';
    var map = L.mapbox.map('map')
    .setView([0, 0], 3);
    
    var info = document.getElementById('info');

    // Use styleLayer to add a Mapbox style created in Mapbox Studio
    L.mapbox.styleLayer('mapbox://styles/fabianrios/cikqb97u2001qaplyggo25dgu').addTo(map);
    
    $.get('countries_all/', function(data){
      data = JSON.parse(data);
      console.log(data);
      var myLayer = L.mapbox.featureLayer().addTo(map);
      myLayer.setGeoJSON(data);
      myLayer.on('click',function(e) {
          // Force the popup closed.
          e.layer.closePopup();
          var feature = e.layer.feature;
          var content = '<div class="country-post"><img src="http://res.cloudinary.com/fabianrios/image/upload/c_fill,h_275,w_400/v'+feature.properties.version+'/'+feature.properties.cover+'.jpg" /><h4 class="title whitetxt">' + feature.properties.title + '</h4>' +
                        '<div class="content"><p>' + feature.properties.description + '</p></div></div>';
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
  
})();
 
 