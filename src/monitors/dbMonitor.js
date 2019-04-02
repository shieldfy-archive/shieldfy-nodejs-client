const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Normalizer = require('../normalizer');
const StackCollector = require('../stackCollector');
const mongooseAsyncHooks = require('../asyncHooks/mongoose');

const DBMonitor = function()
{
    this._callbacks = {
        'mysql': this.mysql,
        'mysql2': this.mysql2,
        'mongodb-core' : this.mongoDB,
        'mongoose' : this.mongoose
    }
}


DBMonitor.prototype.run = function(Client)
{
    let Packages = Object.keys(this._callbacks);
    Hook(Packages,  (exports, name, basedir) => {  
        if(this._callbacks.hasOwnProperty(name) ){
            this._callbacks[name](Client, exports, name)
        }
        return exports;
    });
}


DBMonitor.prototype.mysql = function(Client, exports, name){
    Shimmer.wrap(exports, 'createPool',function(original) {
        return function () {
            var connection = original.apply(this, arguments);
            wrapQuery(Client, connection);
            return connection;
        }
    });

    Shimmer.wrap(exports, 'createPoolCluster',function(original) {
        return function () { 
            var connection = original.apply(this, arguments);
            wrapQuery(Client, connection);
            return connection;
        }
    });

    Shimmer.wrap(exports, 'createConnection',function(original) {
        return function () { 
            var connection = original.apply(this, arguments);
            wrapQuery(Client, connection);
            return connection;
        }
    });

    return exports;
}

DBMonitor.prototype.mysql2 = function(Client, exports, name, version)
{
    Shimmer.wrap(exports, 'createConnection', function(original) {
        return function (query , callback) { 
            var connection = original.apply(this, arguments);
            wrapQuery(Client, connection);
            wrapExecute(Client, connection);
            return connection;
        }
    });

    return exports;
}

 // handle conflict with mongoose
DBMonitor.prototype.mongoose = function(Client, exports, name) {

    Shimmer.wrap(exports, 'model',function(original) {
        return function (schemeName, schemeObj) {
            
            // add this plugin to the scheme to handle the conflict
            if(typeof schemeObj !== "undefined" ){
                schemeObj.plugin(mongooseAsyncHooks);
            }

            var connection = original.apply(this, arguments);
            return connection;
        }
    });
}

DBMonitor.prototype.mongoDB = function(Client, exports,name) {
    // TODO: need to discuse
    // Shimmer.massWrap(exports.Server.prototype, ['insert','update', 'remove', 'auth', 'command', 'cursor'], function(original) {
    Shimmer.massWrap(exports.Server.prototype, ['cursor'], function(original) {
        return function (query ,document, callback) {
            
            if(Client._currentRequest){

                let value = JSON.stringify(document.query)
                let requestParams = Client._currentRequest.getParam();

                if(!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)){
                    
                    for(let param in requestParams){
                        
                        let paramValue = requestParams[param];
                        
                        if(value.indexOf(paramValue) !== -1){
                            
                            //Matched YAY
                            paramValue = new Normalizer(paramValue).run();
                            
                          
                            let Judge = Client._jury.use('db','nosqli');
                            let result = Judge.execute(paramValue);

                            if(result){
                                Client._currentRequest._score += result.score;
                                Client.sendToJail();
                                var stack = new Error().stack;
                                new StackCollector(stack).parse(function(codeInfo){
                                    Client.reportThreat('db', result, codeInfo);
                                });
                            }
                        }
                    }
                }
            }
            var connection = original.apply(this, arguments);
            return connection;
        }
    });
}


function wrapQuery(Client, connection)
{
    Shimmer.wrap(connection, 'query',function(original) {
        return function (query , callback) { 

            if (Client._currentRequest) {
                
                let requestParams = Client._currentRequest.getParam();
                
                if(!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)){
                    if (typeof query === 'object') {

                        wrapQueryObject(query, requestParams, Client);

                    }else{

                        for(let param in requestParams){
                            
                            let paramValue = requestParams[param];
                            if (query.indexOf(paramValue) !== -1) {
                                //Matched YAY
                                paramValue = new Normalizer(paramValue).run();
                                let Judge = Client._jury.use('db','sqli');
                                let result = Judge.execute(paramValue);
                                if (result) {                    
                                    Client._currentRequest._score += result.score;
                                    Client.sendToJail();
                                    var stack = new Error().stack;
                                    new StackCollector(stack).parse(function(codeInfo){
                                        Client.reportThreat('db', result, codeInfo);
                                    });
                                }
                            }
                        }
                    }
                }
            }
            return original.apply(this, arguments);
        }
    });
}

function wrapQueryObject(query, requestParams, Client)
{
    for (const key in query) {
        sqlQuery= query[key];
        
        for (let param in requestParams) {
            
            let paramValue = requestParams[param];
            if (sqlQuery.indexOf(paramValue) !== -1) {
                //Matched YAY
                paramValue = new Normalizer(paramValue).run();
                let Judge = Client._jury.use('db','sqli');
                let result = Judge.execute(paramValue);
                if (result) { 
                    Client._currentRequest._score += result.score;
                    Client.sendToJail();
                    var stack = new Error().stack;
                    new StackCollector(stack).parse(function(codeInfo) {
                        Client.reportThreat('db', result, codeInfo);
                    });
                }
            }
        }
    }
}

function wrapExecute(Client, connection)
{
    Shimmer.wrap(connection, 'execute',function(original) {
        return function (query , callback) { 

            if (Client._currentRequest) {

                let requestParams = Client._currentRequest.getParam();

                if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
                    
                    for (let param in requestParams) {
                        
                        let paramValue = requestParams[param];
                        
                        if (query.indexOf(paramValue) !== -1) {
                            //Matched YAY
                            paramValue = new Normalizer(paramValue).run();
                            let Judge = Client._jury.use('db','sqli');
                            let result = Judge.execute(paramValue);
                            if(result){                      
                                Client._currentRequest._score += result.score;
                                Client.sendToJail();
                                var stack = new Error().stack;
                                new StackCollector(stack).parse(function(codeInfo) {
                                    Client.reportThreat('db', result, codeInfo);
                                });
                            }
                        }
                    }
                }
            }
            return original.apply(this, arguments);
        }
    });
}


module.exports = new DBMonitor;