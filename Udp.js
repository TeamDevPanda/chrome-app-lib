
/**
 * List of all the active udp
 * @global
 *
 * @private
 *
 * @type {array}
 */
var g_udp = [];

/**
 * Class representing a Udp Socket
 * @private
 * @constructor
 *
 * @param {int} socketId
 * @param {string} host
 * @param {int} port
 */
var Udp = function(socketId, host, port) {
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
   * @type {int}
   */
  this._port = port;


  /**
   * Must be set by the user
   *
   * @public
   *
   * @type {function}
   *
   * @param {object info} data (for more info about object info see https://developer.chrome.com/apps/sockets_udp#event-onReceive)
   */
  this.onReceive = undefined;

  g_udp.push(this);
};

/**
 * This static method allow you to bind your udp socket on an address and a port
 * @static
 *
 * @public
 *
 * @param {string} host
 * @param {int} port
 * @returns {promise}
 */
Udp.bind = function(host, port) {
  return new Promise(function(resolve, reject) {
    chrome.sockets.udp.create(function(createInfos) {
      if (createInfos.socketId >= 0) {
        var socket = new Udp(createInfos.socketId, host, port);
        chrome.sockets.udp.bind(socket._socketId, socket._host, socket._port, function(result) {
          if (result < 0) {
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
Udp.prototype.constructor = Udp;

/**
 * This method allow you to send a message with the socket
 *
 * @public
 *
 * @param {ArrayBuffer} data
 * @param {string} address
 * @param {int} port
 * @returns {promise}
 */
Udp.prototype.send = function(ab, address, port) {
  return new Promise(function(resolve, reject) {
    chrome.sockets.udp.send(this._socketId, ab, address, port, function(sendInfo) {
      if (sendInfo.resultCode >= 0) {
        resolve(sendInfo);
      } else {
        reject(sendInfos);
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
Udp.prototype.close = function() {
  return new Promise(function(resolve, reject) {
    chrome.sockets.udp.close(this._socketId, function() {
      resolve();
    });
  }.bind(this));
};

/**
 * This method allow you to join a group
 *
 * @public
 *
 * @param {string} address
 * @returns {promise}
 */
Udp.prototype.joinGroup = function(address) {
  return new Promise(function(resolve, reject) {
    chrome.sockets.udp.joinGroup(this._socketId, address, function(result) {
      if (result >= 0) {
        resolve(result);
      } else {
        reject(result);
      }
    });
  }.bind(this));
};

/**
 * This method allow you to leave a group
 *
 * @public
 *
 * @param {string} address
 * @returns {promise}
 */
Udp.prototype.leaveGroup = function(address) {
  return new Promise(function(resolve, reject) {
    chrome.sockets.udp.leaveGroup(this._socketId, address, function(result) {
      if (result >= 0) {
        resolve(result);
      } else {
        reject(result);
      }
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
chrome.sockets.udp.onReceive.addListener(function(info) {
  for (var i = 0; i < g_udp.length; i++) {
    var udp = g_udp[i];
    if (udp._socketId == info.socketId) {
      if (typeof udp.onReceive == "function") {
        udp.onReceive(info);
      }
    }
  }
});
