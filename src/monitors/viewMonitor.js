'use strict';

var util = require('util');
const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Normalizer = require('../normalizer');
const StackCollector = require('../stackCollector');
const isReflectedXssVector= require('./helper/viewCatchLogic');

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
        Server.prototype.listen = function() {

            // debug('server.listen wrapped');

            //We get the socket for the incoming request here..
            this.on('connection',(socket) => {

                //We can also get the data being written to the far end of the stream -another way to get the request-
                socket.on('data', function(data) { 
                    // debug(data) 
                    var request= data.toString();
                    // var splitIndex= request.indexOf("\r\n\r\n");
                    // if (splitIndex !== -1) {
                    //     var requestHeaders = request.substring(0, splitIndex);
                    //     var requestBody = request.substring(splitIndex+4);
                    // }
                });
                
                //Of course a node process can have many tcp sockets open so we're gonna have to be more selective and only 
                //wrap around the sockets that are related to user requests

                //we wrap around socket.write
                var oldWrite = socket.write
                socket.write = function() { 
                    //We get chunks of data written to the socket, we're going to use our own http parser

                    // TODO: use http-parser-js module to parse chunks of data instead of manual parsing
                    // process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser;
                    // debug('writing ' + JSON.stringify(arguments));
                    
                    // var splitIndex= response.indexOf("\r\n\r\n");
                    // if (splitIndex !== -1) {
                    //     var responseHeaders = response.substring(0, splitIndex);
                    //     var responseBody = response.substring(splitIndex+4);
                    //     if (responseBody) {
                    //         // apply rules
                    //         let JudgeParameters = Client._jury.use('view');
                    //         let result = JudgeParameters.execute(responseBody);
                    //         if(result) {
                    //             Client._currentRequest._score += result.score;
                    //             Client.sendToJail();
                    //             var stack = new Error().stack;
                    //             new StackCollector(stack).parse(function(codeInfo) {
                    //                 Client.reportThreat('view', result, codeInfo);
                    //             });
                    //         }
                    //     }
                    // }
                    var response= arguments[0].toString();
                    if (Client._currentRequest) {
                        let requestParams = Client._currentRequest.getParam();
                        for (let param in requestParams) {
                            let paramValue = requestParams[param];
                            if (isReflectedXssVector(paramValue, response)) {
                                //Matched YAY
                                let JudgeParameters = Client._jury.use('view');
                                let result = JudgeParameters.execute(response);
                                if(result) {
                                    Client._currentRequest._score += result.score;
                                    Client.sendToJail();
                                    var stack = new Error().stack;
                                    new StackCollector(stack).parse(function(codeInfo) {
                                        Client.reportThreat('view', result, codeInfo);
                                    });
                                }
                            }
                        }
                    }

                    //We can do whatever we want with the r here..
                    
                    //Then write the result we want to the socket..
                    return oldWrite.apply(socket, arguments); 
                }
            })

            //Continue..
            return oldListen.apply(this ,arguments);
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