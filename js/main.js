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

      //http.send("<html><pre>echoing:\n" + text + "</pre></html>");
      http.send("_success getting " + path);
      info("served path:" + path);
    });

    var log = function(type, msg) {
      $("#log").append("[" + type + "]" + msg + "\n");
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
