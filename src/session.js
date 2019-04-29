const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Async_hooks = require('./asyncHooks/core');
const Request = require('./request');
const CryptoJS = require("crypto-js");

const Session = function(Client) {

    //attach async hooks to Client->_currentRequest
    Async_hooks(Client);

    const reqForResp = new Map();
    let signature = (() =>
    {
        if (Client._config.appKey && Client._config.appSecret) {
            _signature = CryptoJS.HmacSHA256(Client._config.appKey, Client._config.appSecret).toString();
        } else {
            _signature = "invalid signature";
        }        
        return _signature;
    })();

    //hooking the main HTTP module
    Hook(['http'], function (exports, name, basedir) {
        Shimmer.wrap(exports && exports.Server && exports.Server.prototype, 'emit', function (original) {
            return function (event, req, res) {        
                if (event === 'request') {

                    Client._currentRequest = new Request(Client._sessionId);
                    req._shieldfyID = Client._currentRequest._id;
                    res._shieldfyID = Client._currentRequest._id;
                    Client._currentRequest.start(req,res);

                    reqForResp.set(Client._currentRequest._id,Client._currentRequest);

                    exposeShieldfyHeaders(res);
                    
                    res.on('finish',function() {
                        if (Client._currentRequest) { //if _currentRequest exists
                            Client._currentRequest.setRes(res);
                        }  
                    });
                }   

                let returned = original.apply(this, arguments);
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'setHeader', function (original) {
            return function () {
                if (this.finished) {
                    return; //disable 
                }
                
                let returned = original.apply(this, arguments);
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'writeHead', function (original) {
            return function () {
                if (this.finished) {
                    return; //disable 
                }
                
                let returned = original.apply(this, arguments);
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'write', function (original) {
            return function () {                 
                if (this.finished) {
                    return; //disable 
                }
                
                let returned = original.apply(this, arguments);
                return returned;
            };
        });
        
        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'end', function (original) {
            return function () {
                if (this.finished) {
                    return; //disable 
                }
                reqForResp.delete(this._shieldfyID);
                
                let returned = original.apply(this, arguments);
                return returned;
            }
        });
        return exports;
    });

    function exposeShieldfyHeaders(res)
    {
        res.setHeader('X-Web-Shield', 'ShieldfyWebShield');
        res.setHeader('X-Shieldfy-Signature', signature); 
    }  
}

module.exports = Session;