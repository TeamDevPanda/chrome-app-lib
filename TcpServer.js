/**
 * Warning !!
 * For use the TcpServer class you need:
 *    - Tcp.js
 */


/**
 * Global list of all tcp server
 *
 * @global
 *
 * @private
 *
 * @type {array}
 */
var g_servers_tcp = [];

/**
 * Class representing ServerTcp
 * @private
 * @constructor
 *
 * @param {int} socketId
 * @param {string} host
 * @param {int} port
 */
var ServerTcp = function(socketId, host, port) {
  /**
   * @private
   *
   * @type {int}
   */
  this._socketId = socketId;

  /**
   * @private
   *
   * @type {string}
   */
  this._host = host;

  /**
   * @private
   *
   * @type {int} port
   */
  this._port = port;

  /**
   * Must be set by the user
   *
   * @public
   *
   * @type {function}
   *
   * @param {Tcp} socket
   */
  this.onAccept = undefined;

  g_servers_tcp.push(this);
};

/**
 * This static method allow you to create a tcp server
 * @static
 *
 * @public
 *
 * @param {string} host
 * @param {int} port
 * @returns {promise}
 */
TcpServer.create = function(host, port) {
  return new Promise(function(resolve, reject) {
    chrome.sockets.tcpServer.create(function(createInfos) {
      var server = new ServerTcp(createInfos.socketId, host, port);
      if (server._socketId >= 0) {
        chrome.sockets.tcpServer.listen(server._socketId, server._host, server._port, function(result) {
          if (result >= 0) {
            resolve(server);
          } else {
            reject(result)
          }
        });
      } else {
        reject(createInfos);
      }
    });
  });
};

/**
 * This static method return to you all already opened socket
 * @static
 *
 * @public
 *
 * @return {promise}
 */
ServerTcp.getSockets = function() {
  return new Promise(function(resolve, reject) {
    chrome.sockets.tcpServer.getSockets(function(sockets) {
      resolve(sockets);
    });
  });
}

/**
 * ServerTcp ctor
 *
 * @constructor
 */
ServerTcp.prototype.constructor = ServerTcp;

/**
 * This method close the socket
 *
 * @public
 *
 * @returns {promise}
 */
ServerTcp.prototype.close = function() {
  return new Promise(function(resolve, reject) {
    chrome.sockets.tcpServer.close(this._socketId, function() {
      resolve();
    });
  }.bind(this));
};

/**
 * This global function call the good socket and call your onAccept method
 *
 * @global
 *
 * @pivate
 */
chrome.sockets.tcpServer.onAccept.addListener(function(infos) {
  [].forEach.call(g_servers_tcp, function(g_server_tcp) {
    if (g_server_tcp._socketId == infos.socketId) {
      if (typeof g_server_tcp.onAccept == "function") {
        var socket = new Tcp(infos.clientSocketId);
        g_server_tcp.onAccept(socket);
      }
    }
  });
});
