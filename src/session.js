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

                    console.log('calling emit');
                    Client._currentRequest = new Request(Client._sessionId);
                    req._shieldfyID = Client._currentRequest._id;
                    res._shieldfyID = Client._currentRequest._id;
                    Client._currentRequest.start(req,res);
                    

                    reqForResp.set(Client._currentRequest._id,Client._currentRequest);
                    //console.log(reqForResp);    

                    exposeShieldfyHeaders(res,Client);
                    
                    res.on('finish',function() {
                        if(Client._currentRequest){ //if _currentRequest exists
                            Client._currentRequest.setRes(res);
                        }  
                    });
                }      
                let returned = original.apply(this, arguments)
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'setHeader', function (original) {
            return function () {
                //TODO: remove X-Powered-By
                // let currentRequest = reqForResp.get(this._shieldfyID);  
                // console.log('calling setHeader',arguments);              
                if (this.finished) {
                    //console.log('disable it , request is finished')
                    return false; //disable 
                }
                
                let returned = original.apply(this, arguments);
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'writeHead', function (original) {
            return function () {
                // let currentRequest = reqForResp.get(this._shieldfyID); 
                // console.log('calling writeHead',arguments);               
                if (this.finished) {
                    return false; //disable 
                }
                
                let returned = original.apply(this, arguments);
                return returned;

               
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'write', function (original) {
            return function () {
                // let currentRequest = reqForResp.get(this._shieldfyID);
                 
                // console.log('calling write');               
                if (this.finished) {
                    return false; //disable 
                }
                
                let returned = original.apply(this, arguments);
                return returned;
            };
        });
        
        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'end', function (original) {
            return function () {
                // let currentRequest = reqForResp.get(this._shieldfyID);   
                // console.log('calling end');   
                // console.log(new Error().stack);            
                if (this.finished) {
                    return false; //disable 
                }
                reqForResp.delete(this._shieldfyID);
                
                let returned = original.apply(this, arguments);
                return returned;
            }
        });
        return exports;
    });
        
}

function exposeShieldfyHeaders(res,Client)
{
    res.setHeader('X-Web-Shield', 'ShieldfyWebShield');
    if (Client._config.signature) {
        res.setHeader('X-Shieldfy-Signature', Client._config.signature); 
    } else {
        res.setHeader('X-Shieldfy-Signature', getSignature(Client)); 
    }
    return;
}

//TODO: is signature used any where else ??
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