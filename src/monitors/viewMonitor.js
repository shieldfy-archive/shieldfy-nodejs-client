'use strict';

const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const isReflectedXssVector= require('./helper/viewCatchLogic');
const StackCollector = require('../stackCollector');

const viewMonitor = function()
{
    this._callbacks = {
        'http': this.analyzeResponse,
        'express': this.handleExpress
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


viewMonitor.prototype.analyzeResponse = function(Client, exports, name) {
    Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'write', function (original) {
        return function () {
            var returned = original.apply(this, arguments);
            return returned;
        };
    });

    Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'end', function (original) {
        return function () {
            //TypeError: Cannot read property 'toString' of undefined , when no arguments : curl -I
            var returned = original.apply(this, arguments);
            return returned;
        }
    });
    return exports;
}

viewMonitor.prototype.handleExpress = function(Client, exports, name) {

    //wrap res.end after compression wrapping
    var routerProto = exports.Router && exports.Router.prototype;
    var routerProto = exports.Router;
    

    Shimmer.wrap(routerProto, 'route', orig => {
        return function route (path) {
            var route = orig.apply(this, arguments)
            var layer = this.stack[this.stack.length - 1]

            Shimmer.wrap(layer, 'handle', function (orig) {
                return function (req, res, next) {
                    var _write = res.write;
                    res.write = function(){
                        // arguments
                        var response= arguments[0];
                        if (Client._currentRequest) {
                            let requestParams = Client._currentRequest.getParam();
                            if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
                                for (let param in requestParams) {
                                    let paramValue = requestParams[param];
                                    if (isReflectedXssVector(paramValue, response)) {
                                        //Matched YAY
                                        let JudgeParameters = Client._jury.use('view');
                                        let result = JudgeParameters.execute(paramValue);
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
                        }
                        return _write.apply(this,arguments);
                    }

                    var _end = res.end;
                    res.end = function(){
                        // arguments
                        var response= arguments[0];
                        if (Client._currentRequest) {
                            let requestParams = Client._currentRequest.getParam();
                            if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
                                for (let param in requestParams) {
                                    let paramValue = requestParams[param];
                                    if (isReflectedXssVector(paramValue, response)) {
                                        //Matched YAY
                                        let JudgeParameters = Client._jury.use('view');
                                        let result = JudgeParameters.execute(paramValue);
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
                        }
                        return _end.apply(this,arguments);
                    }

                    var _send = res.send;
                    res.send = function(){
                        // arguments
                        var response= arguments[0];
                        if (Client._currentRequest) {
                            let requestParams = Client._currentRequest.getParam();
                            if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
                                for (let param in requestParams) {
                                    let paramValue = requestParams[param];
                                    if (isReflectedXssVector(paramValue, response)) {
                                        //Matched YAY
                                        let JudgeParameters = Client._jury.use('view');
                                        let result = JudgeParameters.execute(paramValue);
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
                        }
                        return _send.apply(this,arguments);
                    }

                    return orig.apply(this, arguments)
                }
            });

            return route
        }
    })
}

module.exports = new viewMonitor;