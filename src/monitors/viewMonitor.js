'use strict';

var util = require('util');
const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Normalizer = require('../normalizer');
const StackCollector = require('../stackCollector');

const viewMonitor = function()
{
    this._callbacks = {
        'net': this.net,
    }
}

viewMonitor.prototype.run = function(Client)
{
    let Packages = Object.keys(this._callbacks);
    Hook(Packages,  (exports, name, basedir) => {  
        if(this._callbacks.hasOwnProperty(name) ){
            this._callbacks[name](Client, exports, name);
        }
        return exports;
    });
}

viewMonitor.prototype.net = function(Client,exports, name, version)
{
    Shimmer.wrap(exports, 'Server', function(Server) {
                
        var oldListen = Server.prototype.listen;
        Server.prototype.listen = function(port = 1234, host = '0.0.0.0', backlog = 0, callback = '') {

            // debug('server.listen wrapped');

            //We get the socket for the incoming request here..
            this.on('connection',(socket) => {

                //We can also get the data being written to the far end of the stream -another way to get the request-
                // TODO: parse request
                // socket.on('data', function(data) { 
                //     // debug(data) 
                // });
                
                //Of course a node process can have many tcp sockets open so we're gonna have to be more selective and only 
                //wrap around the sockets that are related to user requests

                //we wrap around socket.write
                var oldWrite = socket.write
                socket.write = function() { 
                    //We get chunks of data written to the socket, we're going to use our own http parser

                    // TODO: use http-parser-js module to parse chunks of data instead of manual parsing
                    // process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser;
                    // debug('writing ' + JSON.stringify(arguments));
                    var parsedResponse= arguments[0].split("\r\n\r\n");
                    var headers= parsedResponse[0];
                    var body= parsedResponse[1];

                    //We can do whatever we want with the r here..
                    // TODO: apply rules
                    
                    //Then write the result we want to the socket..
                    oldWrite.apply(socket, arguments); 
                }
            })

            //Continue..
            oldListen.call(this ,port, host, backlog, callback);
        }

        var ctor = function() {

            //To accomodate use of 'new'..
            if(!this instanceof Server){
                return new ctor(...arguments);
            }

            var server = new Server(...arguments)

            return server;
        }

        util.inherits(ctor, Server);

        return ctor;
    })

    return exports;
}

module.exports = new viewMonitor;