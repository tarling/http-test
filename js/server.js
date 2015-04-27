define(['signals'], function(Signal) {

  //based on code from here: https://developer.chrome.com/apps/app_network

  var serverSocketId;
  var clientSocketId;
  function listenAndAccept(socketId) {
    chrome.sockets.tcpServer.listen(socketId,
      self.ip, self.port, function(resultCode) {
        self.info.dispatch("listen operation completed on server socket " + socketId);
        onListenCallback(socketId, resultCode)
    });
  }

  var serverSocketId;
  function onListenCallback(socketId, resultCode) {
    if (resultCode < 0) {
      self.error.dispatch("Error listening:" +
        chrome.runtime.lastError.message);
      return;
    } else {
      self.info.dispatch("listening on server socket " + socketId);
    }
    serverSocketId = socketId;
    chrome.sockets.tcpServer.onAccept.addListener(onAccept)
  }

  function onAccept(info) {
    if (info.socketId != serverSocketId)
      return;

    clientSocketId = info.clientSocketId;

    chrome.sockets.tcp.setKeepAlive(clientSocketId, true, 0, function(resultCode){
      self.info.dispatch("keep alive result code " + resultCode);
    })


    self.info.dispatch("connection made on client socket " + info.clientSocketId);

    chrome.sockets.tcp.onReceive.addListener(function(recvInfo) {
      var data = new Uint8Array(recvInfo.data);
      if (data[0] == 0x82) {

        console.warn("first byte: 0x82")

      } else if (data[0] == 0x88) {

        console.warn("first byte: 0x88")
      }
      self.info.dispatch("received data on client socket " + recvInfo.socketId);
      self.received.dispatch(recvInfo.data);
    });
    chrome.sockets.tcp.onReceiveError.addListener(function(info) {
      self.error.dispatch("chrome.sockets.tcp.onReceiveError on socket " + info.socketId);

      chrome.sockets.tcp.setPaused(info.socketId, false);

      getConnectedId();

      console.dir(info);
    });
    chrome.sockets.tcp.setPaused(info.clientSocketId, false);

    //chrome.sockets.tcpServer.onAccept.removeListener(onAccept)
  }

  function getConnectedId() {
    chrome.sockets.tcp.getSockets(function(list){
      list.some(function(item){

        if (item.connected)
        {
          clientSocketId = item.socketId;
          console.log("found connection at " + clientSocketId);

          return true;
        }
      });
    })
  }

  var self = {};

  self.start = function(i, p) {
    self.ip = i;
    self.port = p;
    chrome.sockets.tcpServer.create({}, function(createInfo) {
      self.info.dispatch("socket created");
      listenAndAccept(createInfo.socketId);
    });
  }

  self.stop = function() {
    chrome.sockets.tcpServer.onAccept.removeListener(onAccept);
    chrome.sockets.tcpServer.disconnect(serverSocketId);
  }

  self.send = function(id, buf) {
    if (chrome.runtime.lastError != null)
    {
      self.error.dispatch("server error @send:" + chrome.runtime.lastError.message + ", clientSocketId:" + clientSocketId)
      self.stop();
    } else {

      chrome.sockets.tcp.send(clientSocketId, buf, function(resultCode){
        if (chrome.runtime.lastError != null)
        {
          self.error.dispatch("server error @send callback:" + chrome.runtime.lastError.message + ", clientSocketId:" + clientSocketId);
          self.stop();
        }
      });
    }
  }

  self.received = new Signal();
  self.error = new Signal();
  self.info = new Signal();

  return self;

});
