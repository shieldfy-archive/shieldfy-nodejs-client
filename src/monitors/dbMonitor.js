const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Normalizer = require('../normalizer');
const StackCollector = require('../stackCollector');
const mongooseAsyncHooks = require('@mongoosejs/async-hooks');

const DBMonitor = function()
{
    this._callbacks = {
        'mysql': this.mysql,
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

 // handle conflict with mongoose
DBMonitor.prototype.mongoose = function(Client, exports, name){

    Shimmer.wrap(exports, 'model',function(original) {
        return function (schemeName, schemeObj) {
            // add this plugin to the scheme to handle the conflict
            schemeObj.plugin(mongooseAsyncHooks);

            var connection = original.apply(this, arguments);
            return connection;
        }
    });
}

DBMonitor.prototype.mongoDB = function(Client, exports,name){
    Shimmer.massWrap(exports.Server.prototype, ['insert', 'update', 'remove', 'auth', 'command', 'cursor'], function(original) {
        return function (query ,document, callback) { 
            
            let value = JSON.stringify(document.query)

            let requestParams = Client._currentRequest.getParam();

            for(let param in requestParams){

                let paramValue = requestParams[param];

                if(value.indexOf(paramValue) !== -1){
                    //Matched YAY
                    paramValue = new Normalizer(value).run();

                    let Judge = Client._jury.use('db','nosqli');
                    let result = Judge.execute(paramValue);
                    if(result){
                        var stack = new Error().stack;
                        var codeInfo= StackCollector.stackCollector(stack);
                        var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                        var path= vulnerableLine[1];
                        var lineNumber= parseInt(vulnerableLine[2]);
                        var codeContent= StackCollector.lineCollector(path, lineNumber);
                        Client._currentRequest._score += result.score;
                        Client.sendToJail('db', result, codeContent, lineNumber, path, codeInfo);
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


            let requestParams = Client._currentRequest.getParam();

            for(let param in requestParams){

                let paramValue = requestParams[param]

                if(query.indexOf(paramValue) !== -1){
                    //Matched YAY
                    paramValue = new Normalizer(query).run();
                    let Judge = Client._jury.use('db','sqli');
                    let result = Judge.execute(paramValue);
                    if(result){                      
                        var stack = new Error().stack;
                        var codeInfo= StackCollector.stackCollector(stack);
                        var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                        var path= vulnerableLine[1];
                        var lineNumber= parseInt(vulnerableLine[2]);
                        var codeContent= StackCollector.lineCollector(path, lineNumber);
                        Client._currentRequest._score += result.score;
                        Client.sendToJail('db', result, codeContent, lineNumber, path, codeInfo);
                    }
                    
                }

            }

            return original.apply(this, arguments);
        }
    });
}


module.exports = new DBMonitor;