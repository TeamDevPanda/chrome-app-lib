
/**
 * Transform an ArrayBuffer to String
 *
 * @public
 *
 * @param {ArrayBuffer} buf
 * @returns {string} data
 */
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

/**
 * Transform string to ArrayBuffer
 * @public
 *
 * @param {string} str
 * @return {ArrayBuffer} buf
 */
function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2);
  var bufView = new Uint16Array(buf);
  for (var i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
