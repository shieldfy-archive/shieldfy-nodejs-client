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
            return function (data) {
                try {
                    if(Client._currentRequest.isDanger()){
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
                        // try {
                        //     // Client._currentRequest._$res.setHeader('Transfer-Encoding','identity');
                        //     Client._currentRequest._$res.setHeader('Content-Type','text/html');
                        // }catch (e) {}
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