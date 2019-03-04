'use strict'

var Client = require('./src/client')

global.log = function(msg){  process._rawDebug(msg); };

module.exports = new Client();