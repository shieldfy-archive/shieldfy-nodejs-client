const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Normalizer = require('../normalizer');
const util = require('util');
const EventEmitter = require('events');

const DBMonitor = function()
{
    this._callbacks = {
        'mysql': this.mysql,
        'mysql2': this.mysql2,
        'mongodb-core' : this.mongoDB
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
                            if(Judge.execute(paramValue)){
                                Judge.sendToJail();
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
        return function (sql, values, callback) { 

            if (Client._currentRequest) {
                
                let requestParams = Client._currentRequest.getParam();
                
                if(!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)){
                    if (typeof sql === 'object') {
                        // TODO: pass value to wrapQueryObject and check it's type
                        if (wrapQueryObject(sql, requestParams, Client)) return mockReturned();

                    }else if (typeof sql === 'string') {

                        if (typeof values === 'string') {
                            if (wrapQueryString(values, requestParams, Client)) return mockReturned();
                        }

                        if (wrapQueryString(sql, requestParams, Client)) return mockReturned();
                    }
                }
            }
            return original.apply(this, arguments);
        }
    });
}

function wrapQueryString(query, requestParams, Client)
{
    for (let param in requestParams) {
                            
        let paramValue = requestParams[param];
        if (query.indexOf(paramValue) !== -1) {
            //Matched YAY
            paramValue = new Normalizer(paramValue).run();

            let Judge = Client._jury.use('db','sqli');
            if (Judge.execute(paramValue)) {
                Judge.sendToJail();
                return true;
            }
        }
    }
    return false;
}

function wrapQueryObject(query, requestParams, Client)
{
    for (const key in query) {
        let sqlQuery = query[key];
        
        for (let param in requestParams) {
            
            let paramValue = requestParams[param];
            if (sqlQuery.indexOf(paramValue) !== -1) {
                //Matched YAY
                paramValue = new Normalizer(paramValue).run();

                let Judge = Client._jury.use('db','sqli');
                if(Judge.execute(paramValue)){
                    Judge.sendToJail();
                    return true;
                }
            }
        }
    }
    return false;
}

function wrapExecute(Client, connection)
{
    Shimmer.wrap(connection, 'execute',function(original) {
        return function (query , callback) { 

            if (Client._currentRequest) {

                let requestParams = Client._currentRequest.getParam();

                if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
                    if (typeof query === 'object') {

                        if (wrapQueryObject(query, requestParams, Client)) return mockReturned();

                    }else if (typeof query === 'string') {

                        for (let param in requestParams) {
                            
                            let paramValue = requestParams[param];
                            if (query.indexOf(paramValue) !== -1) {
                                //Matched YAY
                                paramValue = new Normalizer(paramValue).run();

                                let Judge = Client._jury.use('db','sqli');
                                if(Judge.execute(paramValue)){
                                    Judge.sendToJail();
                                    return mockReturned();
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

function mockReturned () {

    class Emitter extends EventEmitter {}
    // var emitter = new Emitter();
    var returned = function() {
        EventEmitter.call(this);
        // this._connection = emitter;
        // this._socket = emitter;
        // this._protocol = emitter;
    }
    util.inherits(returned, EventEmitter);
    
    return new returned();
}


module.exports = new DBMonitor;