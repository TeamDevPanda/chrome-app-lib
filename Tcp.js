
/**
 * List of all the active tcp
 * @global
 *
 * @private
 *
 * @type {array}
 */
var g_tcp = [];

/**
 * Class representing a Tcp Socket
 * @private
 * @constructor
 *
 * @param {int} socketId
 * @param {string} host
 * @param {int} port
 */
var Tcp = function(socketId, host, port) {
  /**
   * @private
   *
   * @type {int}
   */
  if (socketId) {
    this._socketId = socketId;
  }

  /**
   * @private
   *
   * @type {string}
   */
  if (host) {
    this._host = host;
  }

  /**
   * @private
   *
   * @type {int}
   */
  if (port) {
    this._port = port;
  }

  /**
   * Must be set by the user
   *
   * @public
   *
   * @type {function}
   *
   * @param {ArrayBuffer} data
   */
  this.onReceive = undefined;

  g_tcp.push(this);
};

/**
 * This static method allow you to connect to a server
 * @static
 *
 * @public
 *
 * @param {string} host
 * @param {int} port
 * @returns {promise}
 */
Tcp.connect = function(host, port) {
  return new Promise(function(resolve, reject) {
    chrome.sockets.tcp.create(function(createInfos) {
      if (createInfos.socketId >= 0) {
        var socket = new Tcp(createInfos.socketId, host, port);
        chrome.sockets.tcp.connect(socket._socketId, socket._host, socket._port, function(result) {
          if (result >= 0) {
            resolve(socket);
          } else {
            reject(result);
          }
        });
      } else {
        reject(createInfos.socketId);
      }
    });
  });
};

/**
 * Tcp ctor
 *
 * @constructor
 */
Tcp.prototype.constructor = Tcp;

/**
 * This method allow you to send a message with the socket
 *
 * @public
 *
 * @param {string} data
 * @returns {promise}
 */
Tcp.prototype.send = function(data) {
  return new Promise(function(resolve, reject) {
    chrome.sockets.tcp.send(this._socketId, str2ab(data), function(sendInfos) {
      if (sendInfos.resultCode >= 0) {
        resolve(sendInfos.bytesSent);
      } else {
        reject(sendInfos.resultCode);
      }
    });
  }.bind(this));
};

/**
 * This method close the socket
 *
 * @public
 *
 * return {promise}
 */
Tcp.prototype.close = function() {
  return new Promise(function(resolve, reject) {
    chrome.sockets.tcp.close(this._socketId, function() {
      resolve();
    });
  }.bind(this));
};

/**
 * This listener call the good socket onReceive function
 *
 * @global
 *
 * @private
 */
chrome.sockets.tcp.onReceive.addListener(function(infos) {
  for (var i = 0; i < g_tcp.length; i++) {
    var tcp = g_tcp[i];
    if (tcp._socketId == infos.socketId) {
      if (typeof tcp.onReceive == "function") {
        tcp.onReceive(infos.data);
        break;
      }
    }
  }
});
