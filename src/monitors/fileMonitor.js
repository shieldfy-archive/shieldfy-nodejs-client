const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Normalizer = require('../normalizer');
const StackCollector = require('../stackCollector');

const fileMonitor = function()
{
    this._callbacks = {
        'fs': this.handleFile,
    }
}

fileMonitor.prototype.run = function(Client)
{
    let Packages = Object.keys(this._callbacks);
    Hook(Packages,  (exports, name, basedir) => {  
        if(this._callbacks.hasOwnProperty(name) ){
            this._callbacks[name](Client, exports, name)
        }
        return exports;
    });
}

fileMonitor.prototype.handleFile = function(Client,exports, name, version)
{
    Shimmer.wrap( exports , 'readFile', function (original) {
        return function (path, callback) {
            original(path,'utf8',function(err,data){
                wrapRead(path, Client);
            })
            var returned = original.apply(this, arguments);
            return returned;
        };
    });

    Shimmer.wrap( exports , 'readFileSync', function (original) {
        return function (path, encoding) {
            wrapRead(path, Client);
            var returned = original.apply(this, arguments);
            return returned;
        };
    });

    Shimmer.wrap( exports , 'createReadStream', function (original) {
        return function (path) {
            wrapRead(path, Client);
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    Shimmer.wrap( exports , 'writeFile', function (original) {
        return function (path, data, callback) {
            wrapWrite(path, data, Client);
            var returned = original.apply(this, arguments);
            return returned;
        };
    });
    
    Shimmer.wrap( exports , 'writeFileSync', function (original) {
        return function (path, data) {
            wrapWrite(path, data, Client);
            var returned = original.apply(this, arguments);
            return returned;
        };
    });

    Shimmer.wrap( exports , 'createWriteStream', function (original) {
        return function (path) { 
            if (Client._currentRequest) {
                let allFiles = Client._currentRequest._files;
                if (allFiles.length > 0) {
                    allFiles.forEach(file => {
                        // apply rule to file name
                        let paramValue = file['originalname']
                        if(path.indexOf(paramValue) !== -1){
                            //Matched YAY
                            paramValue = new Normalizer(path).run();
                            let JudgeParameters = Client._jury.use('files','FILENAME');
                            let result = JudgeParameters.execute(paramValue);
                            if(result){
                                Client._currentRequest._score += result.score;
                                Client.sendToJail();
                                var stack = new Error().stack;
                                new StackCollector(stack).parse(function(codeInfo){
                                    Client.reportThreat('file', result, codeInfo);
                                });
                            }
                        }
                    });
                }
                // apply rule to file content
                Shimmer.wrap( this , 'write', function (original) {
                    return function () { 
                        var fileContent = arguments[1].toString();
                        if (fileContent) {
                            fileContent = new Normalizer(fileContent).run();
                            let JudgeParameters = Client._jury.use('files','CONTENT');
                            let result = JudgeParameters.execute(fileContent);
                            if(result){
                                Client._currentRequest._score += result.score;
                                Client.sendToJail();
                                var stack = new Error().stack;
                                new StackCollector(stack).parse(function(codeInfo){
                                    Client.reportThreat('file', result, codeInfo);
                                });
                            }
                        }
                        var returned = original.apply(this, arguments);
                        return returned;
                    }
                });   
            }
            var returned = original.apply(this, arguments);
            return returned;
        }
    });
    return exports;
}

function wrapRead(path, Client)
{
    if (Client._currentRequest) {
        // TODO: test and remove try
        // this try catch statement for unit test perpose
        try {
            let requestPath = Client._currentRequest._url.uri;
            let requestParams = Client._currentRequest.getParam();
            if(requestPath || !(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)){
                // apply file(target: parameters) rules on request parameter
                for(let param in requestParams){
                    let paramValue = requestParams[param]
                    if(path.indexOf(paramValue) !== -1){
                        //Matched YAY
                        paramValue = new Normalizer(path).run();
                        let JudgeParameters = Client._jury.use('files','PARAMETERS');
                        let result = JudgeParameters.execute(paramValue);
                        if(result){
                            Client._currentRequest._score += result.score;
                            Client.sendToJail();
                            var stack = new Error().stack;
                            new StackCollector(stack).parse(function(codeInfo){
                                Client.reportThreat('file', result, codeInfo);
                            });
                        }
                    }
                }
                // apply file(target: url) rules on uri
                if(path.indexOf(requestPath) !== -1){
                    //Matched YAY
                    paramValue = new Normalizer(path).run();
                    let JudgeUrl = Client._jury.use('files','URL');
                    let result = JudgeUrl.execute(paramValue);
                    if(result){
                        Client._currentRequest._score += result.score;
                        Client.sendToJail();
                        var stack = new Error().stack;
                        new StackCollector(stack).parse(function(codeInfo){
                            Client.reportThreat('file', result, codeInfo);
                        });
                    }
                }
            }
        }catch(e) {}
    }
}

function wrapWrite(path, data, Client){
    if (Client._currentRequest) {
        let allFiles = Client._currentRequest._files;
        if (allFiles.length > 0) {
            allFiles.forEach(file => {
                // apply rule to file name
                let paramValue = file['originalname']
                if(path.indexOf(paramValue) !== -1){
                    //Matched YAY
                    paramValue = new Normalizer(path).run();
                    let JudgeParameters = Client._jury.use('files','FILENAME');
                    let result = JudgeParameters.execute(paramValue);
                    if(result){
                        Client._currentRequest._score += result.score;
                        Client.sendToJail();
                        var stack = new Error().stack;
                        new StackCollector(stack).parse(function(codeInfo){
                            Client.reportThreat('file', result, codeInfo);
                        });
                    }
                }
            });
        }
        // apply rule to file content
        var fileContent = data.toString();
        if (fileContent) {
            fileContent = new Normalizer(fileContent).run();
            let JudgeParameters = Client._jury.use('files','CONTENT');
            let result = JudgeParameters.execute(fileContent);
            if(result){
                Client._currentRequest._score += result.score;
                Client.sendToJail();
                var stack = new Error().stack;
                new StackCollector(stack).parse(function(codeInfo){
                    Client.reportThreat('file', result, codeInfo);
                });
            }
        }
    }
}

module.exports = new fileMonitor;