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

    function makeCrossDomain(){
      var reply = "";
      reply += "<cross-domain-policy>\n";
      reply += "<allow-access-from domain=\"*\" to-ports=\"" + PORT + "\"/>\n";
      reply += "</cross-domain-policy>";

      return reply;
    }

    var lastPath;

    http.requestMade.add(function(verb,path, text) {

      //http.send("<html><pre>echoing:\n" + text + "</pre></html>");

      if (path == "crossdomain.xml")
      {
        http.send(makeCrossDomain());
      } else{
        http.send("_success getting " + path);
      }

      if (lastPath != path) info("served path:" + path);

      lastPath = path;

      
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

    var IP = "127.0.0.1", PORT = 17301;
    server.start(IP, PORT);
  }
);
