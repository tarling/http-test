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
      reply += "</cross-domain-policy>\0";

      return reply;
    }

    //var lastPath;

    http.requestMade.add(function(verb,path, text) {

      if (path == "crossdomain.xml")
      {
        http.send(makeCrossDomain());
      } else{
var out = "";
out+="_success WeDo is connected\r\n";
out+="distance 0\r\n";
out+="tilt 0\r\n";
out+="custom 0\r\n";
out+="sensor/distance 0\r\n";
out+="sensor/tilt 0\r\n";
out+="sensor/custom 0\r\n";
out+="_success Wedo Connected\r\n";




        http.send(out);
      }

      //if (lastPath != path) info("served path:" + path);

      //lastPath = path;


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

    function ab2str(buf) {
      //http://stackoverflow.com/questions/6965107
      return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    server.error.add(error);
    server.info.add(info);
    server.received.add(function(buf){
      info("RECEIVED:" + ab2str(buf));
    });

    http.responded.add(function(msg){
      info("SENDING:" + msg);
    });

    info("booting up...");

    var IP = "127.0.0.1", PORT = 17301;
    server.start(IP, PORT);
  }
);
