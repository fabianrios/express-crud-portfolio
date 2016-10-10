(function() {
  $(document).foundation();
  moment.tz.add("Europe/Zurich|CET CEST|-10 -20|01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-19Lc0 11A0 1o00 11A0 1xG10 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|38e4");
  moment.tz.add("America/Bogota|BMT COT COST|4U.g 50 40|0121|-2eb73.I 38yo3.I 2en0|90e5");
  
  var to_remove = {};
  $.get( "/events", function( data ) {
    var result = JSON.parse(data);
    //console.log("result", result);
    var info = [];
    for (var key in result) {
        // console.log(result[key]);
        var este = moment(result[key]["when"]).format("L").toString();
        var ese = moment(result[key]["when"]).format("LT").toString();
        var mas = moment(result[key]["when"]).add(30, 'minutes').format('LT');
        if (to_remove.hasOwnProperty(este)){
          to_remove[este]["hours"].push([ese, mas]);
        }else{
          to_remove[este] = {hours: [[ese, mas]]}
        }
        info.push({
            title  : result[key]["name"],
            start  : moment.tz(result[key]["when"], "Europe/Zurich"),
            allDay : false // will make the time show
        });
        //console.log(key, result[key]);
    }
    console.log(to_remove);
    
    var modal = $('#modal-calendar');
    // console.log(info);
    $('#calendar').fullCalendar({
      events: info,
      dayClick: function(date, jsEvent, view) {
        // console.log('a day has been clicked!');
        // // $(this).css('background-color', 'red');
        // console.log(view, date.format());
        
        // in the pass?
        var now = new Date();
        now.setHours(0,0,0,0);
        if (date < now) {
          return 
        }
         
        var fecha = moment(date).format("LL");  
        $('#hidden-date').val(moment(date).format("l"));
        $('#modal-date').html(fecha);
        modal.foundation('reveal', 'open');
        var este = moment(date).format("L").toString();
        console.log(moment(date).format("L"), to_remove[este]);
        $('#timepicker').timepicker({
            'timeFormat': 'g:i a',
            'disableTimeRanges': to_remove[moment(date).format("L")]["hours"],
            'interval': 30,
            'minTime': '9',
            'maxTime': '6:00pm',
            'defaultTime': '9',
            'startTime': '08:00'
        });
        
      }
    });
    
  });
  

  
  $(".post-calendar").submit(function(e){
    e.preventDefault();
    var $inputs = $('.post-calendar :input');

    // not sure if you wanted this, but I thought I'd add it.
    // get an associative array of just the values.
    var values = {};
    $inputs.each(function() {
        if (this.name == "recibir"){
          if ($(this).is(":checked")){
            values["recibir"] = true;
          }else{
            values["recibir"] = false;
          }
        }else if (this.name == "time"){
            var hour = $(this).val();
            hour = hour.slice(0, -3);
            var to_parse = $("#hidden-date").val()+" "+hour+":00";
            // console.log("to_parse",to_parse);
            var date = new Date(Date.parse(to_parse));
            values["time"] = date;
        }else{
          values[this.name] = $(this).val();
        }
    });
    // console.log(values);
    $.post( "/events", values, function( data ) {
      data = JSON.parse(data);
      // console.log(data);
      var event = [];
      event.push({
          title  : data.name,
          start  : data.when,
          allDay : false // will make the time show
      });
      console.log(event);
      $('#calendar').fullCalendar('addEventSource', event );
      modal.foundation('reveal', 'close');
    });
  });
  
  
  if ($("#fulltext").length){
    CKEDITOR.replace( 'fulltext' ); 
  }

  $("#country-search").keyup(function(event) {
    var str = $(this).val().toLowerCase();
    $("ul.country li").hide();
    $("ul.country li h5.article-names").each(function( index ) {
      var txt = $(this).text().toLowerCase();
      if (txt.indexOf(str) >= 0){
        $(this).parent().show();
      }
    });
  });
  
  $(".close").click(function(e){
    e.preventDefault();
    $(".alert-box").remove();
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
 
 