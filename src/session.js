const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Async_hooks = require('./asyncHooks/core');
const Request = require('./request');
const CryptoJS = require("crypto-js");

const Session = function(Client){

    //attach async hooks to Client->_currentRequest
    Async_hooks(Client);

    const reqForResp = new Map();

    //hooking the main HTTP module
    Hook(['http'], function (exports, name, basedir) {
        Shimmer.wrap(exports && exports.Server && exports.Server.prototype, 'emit', function (original) {
            return function (event, req, res) {        
                if (event === 'request') {
                    Client._currentRequest = new Request();
                    req._shieldfyID = Client._currentRequest._id;
                    res._shieldfyID = Client._currentRequest._id;
                    Client._currentRequest.start(req,res);
                    shieldfyHeaders(Client);

                    reqForResp.set(Client._currentRequest._id,Client._currentRequest);

                    res.on('finish',function() {
                        try{
                            Client._currentRequest.setRes(res);
                        }catch(e) {}   
                    });
                }      
                var returned = original.apply(this, arguments)
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'setHeader', function (original) {
            return function (key,value) {
                if ( Client._currentRequest ) {
                    if( Client._currentRequest.isDanger() &&  key == 'Content-Length'){
                        arguments[1] = String(Client._response.block().length); 
                    }
                }
                
                var returned = original.apply(this, arguments);
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'writeHead', function (original) {
            return function () {
                try{
                    if(Client._currentRequest.isDanger()){
                        arguments[0] = '200';
                        arguments[1] = {
                            'Content-Type': 'text/html',
                            'Transfer-Encoding': 'identity'
                        };
                    }
                }catch(e){}
                var returned = original.apply(this, arguments);
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'write', function (original) {
            return function () {
                var currentRequest = reqForResp.get(this._shieldfyID);                
                if (currentRequest.isDanger()) {
                    arguments[0] = '';
                }
    
                var returned = original.apply(this, arguments);
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'end', function (original) {
            return function () {
                var currentRequest = reqForResp.get(this._shieldfyID);                
                if (currentRequest.isDanger()) {
                    arguments[0] = Client._response.block();
                }
                reqForResp.delete(this._shieldfyID);
                
                var returned = original.apply(this, arguments);
                return returned;
            }
        });
        return exports;
    });
        
}

function shieldfyHeaders(Client)
{
    if ( Client._currentRequest ) {
        Client._currentRequest._$res.setHeader('X-Web-Shield', 'ShieldfyWebShield');
        if (Client._config.signature) {
            Client._currentRequest._$res.setHeader('X-Shieldfy-Signature', Client._config.signature); 
        } else {
            Client._currentRequest._$res.setHeader('X-Shieldfy-Signature', getSignature(Client)); 
        }
    }
    return ;
}

function getSignature(Client)
{
    if (Client._config.appKey && Client._config.appSecret) {
        Client._config.signature = CryptoJS.HmacSHA256(Client._config.appKey, Client._config.appSecret).toString();
    } else {
        Client._config.signature = "invalid signature";
    }
    return Client._config.signature;
}

module.exports = Session;