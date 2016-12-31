(function ( $ ) {
 
    $.fn.hourSelector = function( options ) {
        if(options == "destroy"){
         console.log(options);
         this.html("");
         return this
        }
        
        var that = this;
        // This is the easiest way to have default options.
        var settings = $.extend({
            // These are the defaults.
            ini: 8,
            end: 20,
            out: []
        }, options );
        
        var ul = document.createElement('ul');
        ul.className += "hours";
        this.append(ul);
        
        var input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", "time");
        input.setAttribute("id", "time-date");
        this.append(input);

        //append to form element that you want .
        //document.getElementById("chells").appendChild(input);
        
        for(settings.ini; settings.ini <= settings.end; settings.ini+1){
          var li = document.createElement('li');
          var a =  document.createElement('a');
          a.dataset.hour = settings.ini + ":00";
          if (settings.out.length > 0){
            //console.log(settings.out.indexOf(parseInt(a.dataset.hour)), settings.out, a.dataset.hour);
            if (settings.out.indexOf(a.dataset.hour) > -1) {
              a.className += "out";
            }
          }
          a.innerHTML = settings.ini++ + ":00";
          li.appendChild(a);
          ul.appendChild(li);
        }
        
        this.on('click', 'a', function(e){
          
          if(!$(this).hasClass("out")){
            $(".hours li a").removeClass("active");
            $(this).addClass("active");
            //console.log($(this).data("hour"));
            input.setAttribute("value", $(this).data("hour"));
          }
        });
        
        return this
 
    };
 
}( jQuery ));