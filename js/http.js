define(["./server", "signals"], function(server, Signal) {

  /*

  this:
  - uses server.js to send and receive data using chrome.sockets.tcpServer
  - prefixes a request with an HTTP header
  - decodes data receieved from the socket server

  */

  var nl = "\r\n";

  server.received.add(function(buf) {
    var text = ab2str(buf);

    var lines = text.split("\n");

    var line = lines[0];
    var parts = line.split(" ");
    var verb = parts[0];
    var path = parts[1].substr(1);

    self.requestMade.dispatch(verb, path, text);
  });

  function ab2str(buf) {
    //http://stackoverflow.com/questions/6965107
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  function str2ab(data) {
    var array = new Uint8Array(data.length);
    for (var i=0; i<data.length; i++)
      array[i] = data.charCodeAt(i);
    return array.buffer;
  }

  var self = {};
  self.server = server;
  self.requestMade = new Signal();//verb,path
  self.responded = new Signal();//msg
  self.send = function(msg) {
    //console.info("sending msg:" + msg);
    var header = ""
    header += "HTTP/1.1 200 OK" + nl;
    header += "Content-Type: text/html; charset=ISO-8859-1" + nl;
    header += "Content-Length: " + msg.length + nl;
    header += "Access-Control-Allow-Origin: *" + nl;
    //header += "Connection: keep-alive" + nl;
    header += nl;
    var all = header + msg;

    self.responded.dispatch(all);

    server.send(str2ab(all));
  }
  return self;

});
