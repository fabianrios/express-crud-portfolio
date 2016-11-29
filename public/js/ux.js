(function() {
  
  $(document).foundation();
  
  $(".cancelar").click(function(e){
    e.preventDefault();
    $('#modal-calendar').foundation('reveal', 'close');
  });
  
  var QueryString = function () {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
          // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
          // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
        query_string[pair[0]] = arr;
          // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    } 
    return query_string;
  }();
  
  if(QueryString.o){
    console.log(QueryString.o);
    $("select#categories").val(QueryString.o);
  }
  
  moment.locale("es");
  moment.tz.add("Europe/Zurich|CET CEST|-10 -20|01010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-19Lc0 11A0 1o00 11A0 1xG10 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|38e4");
  moment.tz.add("America/Bogota|BMT COT COST|4U.g 50 40|0121|-2eb73.I 38yo3.I 2en0|90e5");
  moment.tz.add("Europe/Berlin|CET CEST CEMT|-10 -20 -30|01010101010101210101210101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010|-2aFe0 11d0 1iO0 11A0 1o00 11A0 Qrc0 6i00 WM0 1fA0 1cM0 1cM0 1cM0 kL0 Nc0 m10 WM0 1ao0 1cp0 dX0 jz0 Dd0 1io0 17c0 1fA0 1a00 1ehA0 1a00 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|41e5");
  
  var to_remove = {};
  
  $.get( "/events", function( data ) {
    var result = JSON.parse(data);
    //console.log("result", result);
    var info = [];
    for (var key in result) {
        // console.log(result[key]);
        var este = moment(result[key]["when"]).format("L").toString();
        var ese = moment.tz(result[key]["when"], "America/Bogota");
        ese = moment(ese).format("LT").toString();
        var mas = moment.tz(result[key]["when"], "America/Bogota");
        mas = moment(mas).add(60, 'minutes').format('LT');
        //console.log("dia: ", este,"hora real formateada:", ese);
        if (to_remove.hasOwnProperty(este)){
          to_remove[este]["hours"].push([ese, mas]);
        }else{
          to_remove[este] = {hours: [[ese, mas]]}
        }
        info.push({
            title  : result[key]["name"],
            email  : result[key]["email"],
            phone  : result[key]["phone"],
            category : result[key]["category"],
            className : result[key]["category"],
            start  : moment.tz(result[key]["when"], "America/Bogota"),
            allDay : false // will make the time show
        });
    }
    
    //console.log(info);
    
    function getEvents(date){
      var events = [];
      var objev = {};
      info.forEach(function(entry) {
        //console.log(entry.start.format('YYYY-MM-DD'),  moment(date).format('YYYY-MM-DD'));
          if (entry.start.format('YYYY-MM-DD') == date.format()){
              events.push(entry);
              objev[entry.start.format('YYYY-MM-DD')] = events.push(entry);
          }
       });
       //console.log(objev);
       return events;
     }
    
    
    
     var objev = {};
     function getFull(){
       var events = [];
       
       info.forEach(function(entry) {
           //console.log(entry.start.format('YYYY-MM-DD'));
           if(objev.hasOwnProperty(entry.start.format('YYYY-MM-DD'))){
             objev[entry.start.format('YYYY-MM-DD')]++;
           }else{
             objev[entry.start.format('YYYY-MM-DD')] = 1;
           }
           
            if(objev[entry.start.format('YYYY-MM-DD')] >= 13){
              console.log("this day is book", entry.start.format('YYYY-MM-DD'));
            }
        });
        // console.log(objev, events);
      }
      
       getFull(new Date());
       
    var dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
       dias = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    }
    
    $('#calendar').fullCalendar({
      lang: 'es',
      eventLimit: true,
      timeFormat: 'H(:mm)',
      dayNamesShort: dias,
      dayRender: function (date, cell) {
          if (objev[date.format()] >= 13){
            $(".fc-day-top").each(function() {
              if($(this).data("date") == date.format()){
                $(this).addClass("not-this"); 
              }
            });
            cell.addClass("not-available");  
          }
      },
      dayClick: function(date, jsEvent, view) {
        var cuando = jsEvent.target.className.split(" ");
        var currentTime = new Date();
        currentTime = moment(currentTime);
        var lista = [];
        // esta ocupado
        if (getEvents(date).length >= 13) {
          $('#alert-info .aca').html("Este día ya no tiene citas disponibles, intenta con los días que tienen fondo blanco.");
          $('#alert-info').foundation('reveal', 'open');
          return
        }
        if (date.diff(currentTime, 'days') < 0){
          $('#alert-info .aca').html("Esta fecha ya paso, intenta con los días que tienen fondo blanco.");
          $('#alert-info').foundation('reveal', 'open');
          return
        }
        if (date.day() == 0){
          $('#alert-info .aca').html("Este día es domingo, intenta con los días que tienen fondo blanco.");
          $('#alert-info').foundation('reveal', 'open');
          return
        }
          $('input#timepicker').timepicker('remove');
          // in the pass?
          var now    = new Date();
          now.setHours(0,0,0,0);
          if (date < now) {
            return 
          }
        
          var fecha  = moment(date).locale("es").format("LL");
          $('#modal-date').html(fecha);
        
          $('#hidden-date').val(moment(date).format("l"));

          var quitar = typeof to_remove != "undefined" ? to_remove : [];
          if (typeof quitar[moment(date).format("L")] != "undefined"){
            lista  = quitar[moment(date).format("L")]["hours"]; 
          }
          //saturday config
          console.log(moment(date).format("L"),"lista:", lista,"quitar", quitar);
          var config;
          if (moment(date).format("d") == 6){
            config = {
                timeFormat: 'G:i ',
                disableTextInput: true,
                selectOnBlur: true,
                disableTimeRanges: lista,
                step: 60,
                minTime: '8',
                maxTime: '15:00',
                defaultTime: '10',
                dynamic: true,
                dropdown: true,
                scrollbar: true,
                startTime: '08:00'
            }
          }else{
            config = {
                timeFormat: 'G:i ',
                disableTimeRanges: lista,
                disableTextInput: true,
                selectOnBlur: true,
                step: 60,
                minTime: '7',
                maxTime: '20:00',
                defaultTime: '12',
                dynamic: true,
                dropdown: true,
                scrollbar: true,
                startTime: '07:00'
            }
          }
          
          $('input#timepicker').timepicker(config);
          $('#modal-calendar').foundation('reveal', 'open');
      }
    });
    
    var cat = {
    "acidoh":"Aplicación ácido hialurónico",
    "botox":"Aplicación toxina botulínica tipo a",
    "rejuve":"Rejuvenecimiento facial con plasma rico en plaquetas",
    "homeo":"Aplicación de homeopatía facial",
    "micro":"Microdermoabrasión",
    "radio":"thermage",
    "colageno":"Inducción de colágeno",
    "fre":"Radiofrecuencia",
    "harmony":"Harmony",
    "vela":"Velashape",
    "lipomax":"Limopax",
    "bodp":"Bodyterm premium",
    "lpg":"LPG",
    "pixelco":"Pixel corporal",
    "manthus":"Manthus",
    "futura":"futura"
    }
   
    if($("#events-calendar")){
      $('#events-calendar').fullCalendar({
      lang: 'es',
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay'
      },
      defaultView: 'agendaWeek',
      events: info,
      borderColor: "white",
      eventLimit: true,
      timeFormat: 'H(:mm)',
      dayNamesShort: dias,
      eventClick: function(calEvent, jsEvent, view) {
         $(".here").html("<h3>"+calEvent.title+"</h3><p><span class='fa fa-phone'> "+calEvent.phone+"</span></p>"+"<p><span class='fa fa-envelope-o'> "+calEvent.email+"</span></p>"+"<p><span class='fa fa-angle-right'> "+cat[calEvent.category]+"</span></p>");
         $('#event-info').foundation('reveal', 'open');
        //console.log('Event: ' + calEvent.title + calEvent.phone);
      },
      });
    }
    
  });
  
  $(".post-calendar").submit(function(e){
    e.preventDefault();
    var $inputs = $('.post-calendar :input');

    // not sure if you wanted this, but I thought I'd add it.
    // get an associative array of just the values.
    var values = {};
    
    // Becouse we switch to spanish
    var convertDate = function(usDate) {
      //console.log(usDate);
      var dateParts = usDate.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      var back = dateParts[2] + " " + dateParts[1] + " " + dateParts[3];
      return back;
    }
    
    var look_up;
    var lookDate = function(usDate) {
      var dateParts = usDate.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateParts[1] < 10){
        dateParts[1] = "0"+dateParts[1];
      }
      var back = dateParts[1] + "/" + dateParts[2] + "/" + dateParts[3];
      return back;
    }
    
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
            var hd = convertDate($("#hidden-date").val());
            look_up = lookDate($("#hidden-date").val());
            var to_parse = hd+" "+hour+"00:00 GMT-0500";
            var fixhour = hour.split(":");
            var date = new Date(to_parse);
            // console.log(to_parse,"---", date);
            //console.log("date",date);
            values["time"] = date;
        }else{
          values[this.name] = $(this).val();
        }
    });
    //console.log("values to post: ", values);
    $.post( "/events", values, function() {})
    .done(function(data, resp) {
      data = JSON.parse(data);
      //console.log(data);
      var event_where = moment.tz(data.when, "America/Bogota");
      var event = [];
      //console.log(event_where, data.when);
      event.push({
          title  : data.name,
          start  : event_where,
          allDay : false // will make the time show
      });
      //dont put it there
      //$('#calendar').fullCalendar('addEventSource', event);
      $('#modal-calendar').foundation('reveal', 'close');
      //console.log(data, resp);
      if(resp == "success"){
        
        var una = moment(event_where).format("LT").toString();
        var dos = moment.tz(event_where, "America/Bogota");
        dos = moment(dos).add(60, 'minutes').format('LT');
        
        
        if (to_remove.hasOwnProperty(look_up)){
          to_remove[look_up]["hours"].push([una, dos]);
        }else{
          to_remove[look_up] = {hours: [[una, dos]]}
        }
        
      function alertDisplay(){ // console.log(to_remove,to_remove[look_up]);
        $('#alert-info .aca').html("tu cita fue agendada");
        $('#alert-info').foundation('reveal', 'open');
        $('.post-calendar :input').val('');
        setTimeout(function() { $('#jsalert').hide(); }, 3000);
      }
        
      setTimeout(function() { alertDisplay(); }, 1000);
        
      }
     })
     .fail(function(err) {
       //console.log("err", err);
       var response = JSON.parse(err.responseText).error;
       console.log(response);
       $('#modal-calendar').foundation('reveal', 'close');
       return
     });
  });
  
  
  $('.close-reveal').click(function(){
    $('#alert-info').foundation('reveal', 'close');
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
  
  if($("#cope-1")){
    $("#cope-1").appendTo(".fulltext");
  }
  
  
  // if ($('.slider')){
  //   $('.slider').bxSlider({
  //      slideWidth: 200,
  //      minSlides: 5,
  //      moveSlides: 5,
  //      slideMargin: 1
  //    });
  //  }
   
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
     $(".navigation, .social").slideToggle("fast");
     $(".text-banner").toggleClass("vcontrol");
     $(".logo").toggleClass("opened");
   });
   
   
   if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
     $("body").addClass("mobile");
   }else{
      var n = 1;
      window.setInterval(function(){
        n < 3 ? n++ : n = 1;
        var arrayClass = ["","","second","third"];
        var slider = "url(../img/slider"+n+".jpg)"
        console.log(slider);
        $(".nav.home").animate({opacity: 0}, 200, function() {
          $(this).css({"background-image":slider}).animate({opacity: 1});
          $(".text-banner").addClass(arrayClass[n]).removeClass(arrayClass[n-1]);
        });
      }, 20000);
   }
   
   
   var isiPhone = navigator.userAgent.toLowerCase().indexOf("iphone");
   var isAndroid = navigator.userAgent.toLowerCase().indexOf("android");
   if(isiPhone > -1 || isAndroid > -1){
     $('meta[name=viewport]').attr('content','width=device-width, user-scalable=no');
     $("#viewport").attr("content", "width=device-width, user-scalable=no");
   }		
   
  
})();
 
 