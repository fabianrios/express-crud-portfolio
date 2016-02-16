 CKEDITOR.replace( 'fulltext' );
 
 (function() {
     document.getElementById("file_input").onchange = function(){
         var files = document.getElementById("file_input").files;
         var file = files[0];
         if(file == null){
             alert("No file selected.");
         }
         else{
             get_signed_request(file);
         }
     };
 })();