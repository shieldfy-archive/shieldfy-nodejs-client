'use strict';

const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const util = require('util');
const isSSRFVector= require('./helper/SSRFMonitorCatchLogic');
const SSRFJudgeFudge= require('./helper/SSRFJudgeFudge');
const { URL } = require('url');

const ssrfMonitor = function()
{
    this._callbacks = {
        'http': this.http,
        'http2': this.http2
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
                            if (isSSRFVector(requestParams[param],arguments[0])) {
                                // add try catch
                                let urlOb = new URL(arguments[0]);
                                let host = urlOb.host || urlOb.hostname;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                }
                            }
                        }
                        
                        // TODO: refactor this
                        // try{
                        //     let urlOb = new URL(arguments[0]);
                        //     let host = urlOb.host || urlOb.hostname;
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
                            if (isSSRFVector(requestParams[param],arguments[0])) {
                                // add try catch
                                let urlOb = new URL(arguments[0]);
                                let host = urlOb.host || urlOb.hostname;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                }
                            }
                        }

                        // TODO: refactor this
                        // try{
                        //     let urlOb = new URL(arguments[0]);
                        //     let host = urlOb.host || urlOb.hostname;
                        //     let result = SSRFJudgeFudge(host)
                        //     Client.sendToJail('ssrf', result, );
                        // }catch (e) {

                        // }
                        
                    } else if (typeof(arguments[0]) == 'object') {
                    
                        let protocol= arguments[0].protocol == 'https:' || arguments[0].agent.protocol == 'https:' || arguments[0].uri.protocol == 'https:'
                        ? 'https:' : 'http:';
                        
                        let urlOb = protocol + '//' + arguments[0].host + ':' + arguments[0].port + arguments[0].path;
                        for (let param in requestParams) {
                            if (isSSRFVector(requestParams[param],urlOb)) {
                                let host = urlOb.host || urlOb.hostname;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                }
                            }
                        }
                        
                        // TODO: refactor this
                        // let host = urlOb.host || urlOb.hostname;
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
                            if (isSSRFVector(requestParams[param],arguments[0])) {
                                // add try catch
                                let urlOb = new URL(arguments[0]);
                                let host = urlOb.host || urlOb.hostname;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                }
                            }
                        }
                        
                        // TODO: refactor this
                        // try{
                        //     let urlOb = new URL(arguments[0]);
                        //     let host = urlOb.host || urlOb.hostname;
                        //     let result = SSRFJudgeFudge(host)
                        //     Client.sendToJail('ssrf', result, );
                        // }catch (e) {

                        // }
                        
                    } else if (typeof(arguments[0]) == 'object') {
                        
                        let protocol= arguments[0].protocol == 'https:' || arguments[0].agent.protocol == 'https:' || arguments[0].uri.protocol == 'https:'
                        ? 'https:' : 'http:';
                        
                        let urlOb = protocol + '//' + arguments[0].host + ':' + arguments[0].port + arguments[0].path;
                        for (let param in requestParams) {
                            if (isSSRFVector(requestParams[param],urlOb)) {
                                let host = urlOb.host || urlOb.hostname;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                }
                            }
                        }

                        // TODO: refactor this
                        // let host = urlOb.host || urlOb.hostname;
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

ssrfMonitor.prototype.http2 = function(Client,exports, name, version)
{
    Shimmer.wrap(exports, 'connect', function(original) {

        return function () { 
            if (Client._currentRequest) {
                let requestParams = Client._currentRequest.getParam();
                if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
                    if (typeof(arguments[0]) == 'string') {
                        for (let param in requestParams) {
                            if (isSSRFVector(requestParams[param],arguments[0])) {
                                // add try catch
                                let urlOb = new URL(arguments[0]);
                                let host = urlOb.host || urlOb.hostname;
                                
                                let Judge = Client._jury.use('ssrf');
                                if (Judge.execute(host)) {
                                    Judge.sendToJail();
                                }
                            }
                        }

                        // TODO: refactor this
                        // try{
                        //     let urlOb = new URL(arguments[0]);
                        //     let host = urlOb.host || urlOb.hostname;
                        //     let result = SSRFJudgeFudge(host)
                        //     Client.sendToJail('ssrf', result, );
                        // }catch (e) {
                            
                        // }
                    }
                }
            }
            return original.apply(this, arguments);
        }
    })

    return exports;
}

module.exports = new ssrfMonitor;