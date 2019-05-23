'use strict';

const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const util = require('util');
const EventEmitter = require('events');
const { ClientRequest } = require('_http_client');
const { OutgoingMessage } = require('_http_outgoing');
const { URL } = require('url');

const ssrfMonitor = function()
{
    this._callbacks = {
        'http': this.http,
        // 'http2': this.http2
    }
}

ssrfMonitor.prototype.run = function(Client)
{
    let Packages = Object.keys(this._callbacks);
    Hook(Packages,  (exports, name, basedir) => {  
        if(this._callbacks.hasOwnProperty(name) ){
            this._callbacks[name](Client, exports, name);
        }
        return exports;
    });
}

ssrfMonitor.prototype.http = function(Client,exports, name, version)
{
    Shimmer.wrap(exports, 'ClientRequest', function(original) {

        var ctor = function() {
            if (Client._currentRequest) {
                let requestParams = Client._currentRequest.getParam();
                if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
                    if (typeof(arguments[0]) == 'string') {
                        for (let param in requestParams) {
                                if (arguments[0].indexOf(requestParams[param]) !== -1) {
                                let urlOb = new URL(arguments[0]);
                                let host = urlOb.hostname || urlOb.host;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                    if (Client._config.action == 'listen') return original.apply(this, arguments);
                                    return mockReturnedHttpRequest();
                                }
                            }
                        }
                        
                        // TODO: refactor this
                        // try{
                        //     let urlOb = new URL(arguments[0]);
                        //     let host = urlOb.hostname || urlOb.host;
                        //     let result = SSRFJudgeFudge(host)
                        //     Client.sendToJail('ssrf', result, );
                            
                        // }catch (e) {
                            
                        // }
                    }
                }
            }

            //To accomodate use of 'new'..
            if(!this instanceof ctor){
                return new ctor(...arguments);
            }

            return new original(...arguments)
        }

        util.inherits(ctor, original);

        return ctor;
    });

    Shimmer.wrap(exports, 'request', function(original) {

        return function () { 
            if (Client._currentRequest) {
                let requestParams = Client._currentRequest.getParam();
                if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
                    if (typeof(arguments[0]) == 'string') {
                        for (let param in requestParams) {
                            if (arguments[0].indexOf(requestParams[param]) !== -1) {
                                let urlOb = new URL(arguments[0]);
                                let host = urlOb.hostname || urlOb.host;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                    if (Client._config.action == 'listen') return original.apply(this, arguments);
                                    return mockReturnedHttpRequest();
                                }
                            }
                        }

                        // TODO: refactor this
                        // try{
                        //     let urlOb = new URL(arguments[0]);
                        //     let host = urlOb.hostname || urlOb.host;
                        //     let result = SSRFJudgeFudge(host)
                        //     Client.sendToJail('ssrf', result, );
                        // }catch (e) {

                        // }
                        
                    } else if (typeof(arguments[0]) == 'object') {
                        
                        let protocol= arguments[0].protocol == 'https:' ? 'https:' : 'http:';
                        let hostValue = arguments[0].hostname || arguments[0].host
                        let urlOb = protocol + '//' + hostValue + ':' + arguments[0].port + arguments[0].path;
                        for (let param in requestParams) {
                            if (urlOb.indexOf(requestParams[param]) !== -1) {
                                urlOb= new URL(urlOb)
                                let host = urlOb.hostname || urlOb.host;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                    if (Client._config.action == 'listen') return original.apply(this, arguments);
                                    return mockReturnedHttpRequest();
                                }
                            }
                        }
                        
                        // TODO: refactor this
                        // let host = urlOb.hostname || urlOb.host;
                        // let result = SSRFJudgeFudge(host)
                        // Client.sendToJail('ssrf', result, );
                    }
                }
            }

            return original.apply(this, arguments);
        }
    });

    Shimmer.wrap(exports, 'get', function(original) {

        return function () { 
            if (Client._currentRequest) {
                let requestParams = Client._currentRequest.getParam();
                if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
                    if (typeof(arguments[0]) == 'string') {
                        for (let param in requestParams) {
                            if (arguments[0].indexOf(requestParams[param]) !== -1) {
                                let urlOb = new URL(arguments[0]);
                                let host = urlOb.hostname || urlOb.host;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                    if (Client._config.action == 'listen') return original.apply(this, arguments);
                                    return mockReturnedHttpRequest();
                                }
                            }
                        }
                        
                        // TODO: refactor this
                        // try{
                        //     let urlOb = new URL(arguments[0]);
                        //     let host = urlOb.hostname || urlOb.host;
                        //     let result = SSRFJudgeFudge(host)
                        //     Client.sendToJail('ssrf', result, );
                        // }catch (e) {

                        // }
                        
                    } else if (typeof(arguments[0]) == 'object') {
                        
                        let protocol= arguments[0].protocol == 'https:' ? 'https:' : 'http:';
                        let hostValue = arguments[0].hostname || arguments[0].host
                        let urlOb = protocol + '//' + hostValue + ':' + arguments[0].port + arguments[0].path;
                        for (let param in requestParams) {
                            if (urlOb.indexOf(requestParams[param]) !== -1) {
                                urlOb= new URL(urlOb)
                                let host = urlOb.hostname || urlOb.host;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                    if (Client._config.action == 'listen') return original.apply(this, arguments);
                                    return mockReturnedHttpRequest();
                                }
                            }
                        }

                        // TODO: refactor this
                        // let host = urlOb.hostname || urlOb.host;
                        // let result = SSRFJudgeFudge(host)
                        // Client.sendToJail('ssrf', result, );
                    }
                }
            }
            return original.apply(this, arguments);
        }
    });

    return exports;
}

// disable this module because it is an experimental
// ssrfMonitor.prototype.http2 = function(Client,exports, name, version)
// {
//     Shimmer.wrap(exports, 'connect', function(original) {

//         return function () { 
//             if (Client._currentRequest) {
//                 let requestParams = Client._currentRequest.getParam();
//                 if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
//                     if (typeof(arguments[0]) == 'string') {
//                         for (let param in requestParams) {
//                             if (arguments[0].indexOf(requestParams[param]) !== -1) {
//                                 let urlOb = new URL(arguments[0]);
//                                 let host = urlOb.hostname || urlOb.host;
                                
//                                 let Judge = Client._jury.use('ssrf');
//                                 if (Judge.execute(host)) {
//                                     Judge.sendToJail();
//                                     // TODO: mock the return value
//                                 }
//                             }
//                         }

//                         // TODO: refactor this
//                         // try{
//                         //     let urlOb = new URL(arguments[0]);
//                         //     let host = urlOb.hostname || urlOb.host;
//                         //     let result = SSRFJudgeFudge(host)
//                         //     Client.sendToJail('ssrf', result, );
//                         // }catch (e) {
                            
//                         // }
//                     }
//                 }
//             }
//             return original.apply(this, arguments);
//         }
//     })

//     return exports;
// }

function mockReturnedHttpRequest () {
    var returned = function() {
        EventEmitter.call(this);
        OutgoingMessage.call(this);
    }

    returned.prototype = ClientRequest.prototype;

    util.inherits(returned, EventEmitter);
    Object.setPrototypeOf(returned.prototype, OutgoingMessage.prototype);
    Object.setPrototypeOf(returned, OutgoingMessage);

    return new returned();
}

module.exports = new ssrfMonitor;