'use strict';

const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const isReflectedXssVector= require('./helper/viewCatchLogic');
const StackCollector = require('../stackCollector');
const semver = require('semver');
const fs = require('fs')
const path = require('path')

const viewMonitor = function()
{
    this._callbacks = {
        'express': this.handleExpress
    }
}

viewMonitor.prototype.run = function(Client)
{
    let Packages = Object.keys(this._callbacks);
    Hook(Packages,  (exports, name, basedir) => {  
        var pkg, version;
        if (basedir) {
            pkg = path.join(basedir, 'package.json');
            try {
              version = JSON.parse(fs.readFileSync(pkg)).version;
            } catch (e) {
                return exports;
            }
        } else {
            version = process.versions.node;
        }
        
        if (this._callbacks.hasOwnProperty(name) ) {
            this._callbacks[name](Client, exports, name, version);
        }
        return exports;
    });
}

viewMonitor.prototype.handleExpress = function(Client, exports, name, version) {

    //wrap res.end after compression wrapping    
    var routerProto = semver.satisfies(version, '^5') ? (exports.Router && exports.Router.prototype) : exports.Router;    

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