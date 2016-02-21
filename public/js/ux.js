 (function() {
   if ($("#fulltext").length){
     CKEDITOR.replace( 'fulltext' );
     
     document.getElementById("image_upload").onchange = function(){
         var files = document.getElementById("image_upload").files;
         var file = files[0];
         if(file == null){
             console.log("No file selected.");
         }
         else{
             upload_file(file);
         }
     };
     
    }
     
     function upload_file(file){
       console.log("file", file);
       // $( "#imagin" ).submit();
       // $.ajax({
       //   method: "GET",
       //   url: "/upload_image",
       //   data: { file_name: file.name, location: "Boston" }
       // })
       // .done(function( msg ) {
       //   console.log( "Data Saved: " + msg );
       // })
       // .fail(function( jqXHR, textStatus ) {
       //   console.log( "Request failed: " + textStatus );
       // });
     }
     
     
     $('#like').click(function(e){
       e.preventDefault();
       $id = $(this).attr("data-id");
       console.log($id);
       $.post('like/', { 'id': $id }, function(data){
         $("#increment").html(data);
       });
     });
     
     if($("#map")){
       L.mapbox.accessToken = 'pk.eyJ1IjoiZmFiaWFucmlvcyIsImEiOiJjaWc3ZDFhMjMwczFvdjRrcHF4bXliMzNoIn0.PTi-JKyYhEaQknlR6iGCoA';
       var map = L.mapbox.map('map')
           .setView([0, 0], 3);

       // Use styleLayer to add a Mapbox style created in Mapbox Studio
       L.mapbox.styleLayer('mapbox://styles/fabianrios/cikqb97u2001qaplyggo25dgu').addTo(map);
       map.touchZoom.disable();
       map.doubleClickZoom.disable();
       map.scrollWheelZoom.disable();
     }
 })();
 
 