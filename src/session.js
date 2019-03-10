const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Async_hooks = require('./asyncHooks/core');
const Request = require('./request');
const Normalizer = require('./normalizer');


const Session = function(Client){

    //attach async hooks to Client->_currentRequest
    Async_hooks(Client);

    //hooking the main HTTP module
    Hook(['http'], function (exports, name, basedir) {
        Shimmer.wrap(exports && exports.Server && exports.Server.prototype, 'emit', function (original) {
            return function (event, req, res) {        
                if (event === 'request') {
                    Client._currentRequest = new Request()

                    Client._currentRequest.start(req,res);


                    res.on('finish',function() {
                        try{
                            Client._currentRequest.setRes(res);
                        }catch(e) {}
                        
                        /**
                         * Disable session step for now to optimize the execution
                         */
                        // Client._http._api.trigger('session/step', {
                        //     sessionId: Client._sessionId,
                        //     host: Client._currentRequest._headers.host,
                        //     info: {
                        //         method: Client._currentRequest._method,
                        //         uri: Client._currentRequest._url.uri,
                        //         code: Client._currentRequest._statusCode,
                        //         time: Client._currentRequest._created
                        //     },
                        //     user: {
                        //         id: Client._currentRequest._id,
                        //         ip: Client._currentRequest._ip,
                        //         userAgent: Client._currentRequest._headers['user-agent'],
                        //         score: Client._currentRequest._score,
                        //     },  
                        // });
    
        
                    });
                }      
                var returned = original.apply(this, arguments)
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'writeHead', function (original) {
            return function () {
                try{

                    if(Client._currentRequest.isDanger()){
                        arguments[0] = '403';
                        arguments[1] = {
                            'Content-Type': 'text/html',
                            'Transfer-Encoding': 'chunked'
                        };
                    }
                }catch(e){}
    
    
                var returned = original.apply(this, arguments);
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'write', function (original) {
            return function () {
                try {
                    if(Client._currentRequest.isDanger()){
                        try {
                            Client._currentRequest._$res.setHeader('Transfer-Encoding','chunked');
                            Client._currentRequest._$res.setHeader('Content-Type','text/html');
                        }catch (e) {}
                        arguments[0] = '';
                    }
    
                }catch (e) {}
    
                var returned = original.apply(this, arguments);
                return returned;
            };
        });

        Shimmer.wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'end', function (original) {
            return function () {
                try {
                    if(Client._currentRequest.isDanger()){
                        try {
                            Client._currentRequest._$res.setHeader('Transfer-Encoding','chunked');
                            Client._currentRequest._$res.setHeader('Content-Type','text/html');
                        }catch (e) {}
                        arguments[0] = Client._response.block();
                    }
                    Client._currentRequest.end();
                }catch(e) {}
                var returned = original.apply(this, arguments);
                return returned;
            }
        });
        return exports;
    });
        
}


module.exports = Session;