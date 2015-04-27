define(["./server", "signals"], function(server, Signal) {

  /*

  this:
  - uses server.js to send and receive data using chrome.sockets.tcpServer
  - prefixes a request with an HTTP header
  - decodes data receieved from the socket server

  */

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
    //https://github.com/khanning/chrome-wedo-helper/blob/master/src/js/socket.js
    var array = new Uint8Array(data.length+2);
    array[0] = 0x81;
    array[1] = data.length;
    for (var i=0; i<data.length; i++)
      array[i+2] = data.charCodeAt(i);

    return array.buffer;
  }

  var self = {};
  self.server = server;
  self.requestMade = new Signal();//verb,path
  self.responded = new Signal();//msg
  self.send = function(msg) {
    //console.info("sending msg:" + msg);
    var header = ""
    header += "HTTP/1.1 200 OK\n";
    header += "Content-Type: text/html; charset=ISO-8859-1\n";
    header += "Content-Length: " + msg.length + "\n";
    header += "Access-Control-Allow-Origin: *\n";
    header += "Connection: keep-alive\n\n";

    self.responded.dispatch(msg);

    server.send(str2ab(header + msg + "\0"));
  }
  return self;

});
