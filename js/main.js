require.config({
    paths: {
        "jquery": '../lib/jquery-1.11.2.min',
        "signals": '../lib/signals.min'
    }
});

require( [
    "jquery"
    ,"./server"
    ,"./http"
  ],
  function($, server, http, testHttp) {

    http.requestMade.add(function(verb,path, text) {

      http.send("_success getting " + path);
      info("served path:" + path);
    });

    $("#send").click(function(){
      var url = "http://" + IP + ":" + PORT + "/" + (new Date()).getTime();
      $.ajax({
        url: url
      }).done(function( data ) {
        info("asked for " + url)
      });
    });

    var log = function(type, msg) {
      var el = $("#log");
      el.append("[" + type + "]" + msg + "\n");
      el.scrollTop(el.prop("scrollHeight"));
    }
    var info = function(msg){
      log("INFO",msg);
    }
    var error = function(msg){
      log("ERROR",msg);
    }

    server.error.add(error);
    server.info.add(info);

    var IP = "127.0.0.1", PORT = 12345;
    server.start(IP, PORT);
  }
);
