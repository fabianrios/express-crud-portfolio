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

    // Use styleLayer to add a Mapbox style created in Mapbox Studio
    L.mapbox.styleLayer('mapbox://styles/fabianrios/cikqb97u2001qaplyggo25dgu').addTo(map);
    
    $.get('countries_all/', function(data){
      data = JSON.parse(data);
      for(var i=0; i < data.coord.length; i++) {
        console.log( ": "+ data.coord[i]);
        L.marker(data.coord[i]).addTo(map);
      };
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
 
 