define(['signals'], function(Signal) {

  //based on code from here: https://developer.chrome.com/apps/app_network

  var serverSocketId;
  var clientSocketId;

  function info(msg) {
    self.info.dispatch(msg);
  }
  function error(msg) {
    self.error.dispatch(msg);
  }


  function listenAndAccept() {
    chrome.sockets.tcp.onReceive.addListener(onReceive);
    chrome.sockets.tcp.onReceiveError.addListener(onReceiveError);
    chrome.sockets.tcpServer.listen(serverSocketId, self.ip, self.port, onListenCallback);
  }

  function onListenCallback(resultCode) {
    if (resultCode < 0) {
      error("Error listening:" + chrome.runtime.lastError.message);
      return;
    } else {
      info("listening on server socket " + serverSocketId);
    }
    chrome.sockets.tcpServer.onAccept.addListener(onAccept)
  }

  function onReceive(recvInfo) {
    var data = new Uint8Array(recvInfo.data);
    if (data[0] == 0x82) {

      console.warn("first byte: 0x82")

    } else if (data[0] == 0x88) {

      console.warn("first byte: 0x88")
    }
    if (recvInfo.socketId != clientSocketId) info("received data on client socket " + recvInfo.socketId);
    clientSocketId = recvInfo.socketId;
    self.received.dispatch(recvInfo.data);
  }

  function onReceiveError(recvInfo) {
    error("chrome.sockets.tcp.onReceiveError on socket " + recvInfo.socketId);

    if (recvInfo.resultCode == -100) {
      info("connection closed");
      close(recvInfo.socketId);
    }
  }

  function close(socketId) {
    chrome.sockets.tcp.disconnect(socketId, function(){
      info("disconnected " + socketId);
      chrome.sockets.tcp.close(socketId, function(){
        info("closed " + socketId);
      });
    });
  }

  function onAccept(recvInfo) {
    if (recvInfo.socketId != serverSocketId)
      return;

    clientSocketId = recvInfo.clientSocketId;

    chrome.sockets.tcp.setKeepAlive(clientSocketId, true, 0, function(resultCode){
      info("keep alive result code " + resultCode);
    })
    info("connection made on client socket " + clientSocketId);

    chrome.sockets.tcp.setPaused(clientSocketId, false);
  }

  var self = {};

  self.start = function(i, p) {
    self.ip = i;
    self.port = p;
    chrome.sockets.tcpServer.create({}, function(createInfo) {
      info("socket created");
      serverSocketId = createInfo.socketId;
      listenAndAccept();
    });
  }

  self.send = function(buf) {
    if (chrome.runtime.lastError != null)
    {
      error("server error @send:" + chrome.runtime.lastError.message + ", clientSocketId:" + clientSocketId)
    } else {

      chrome.sockets.tcp.send(clientSocketId, buf, function(resultCode){
        if (chrome.runtime.lastError != null)
        {
          error("server error @send callback:" + chrome.runtime.lastError.message + ", clientSocketId:" + clientSocketId);
        }
      });
    }
  }

  self.received = new Signal();
  self.error = new Signal();
  self.info = new Signal();

  return self;

});
