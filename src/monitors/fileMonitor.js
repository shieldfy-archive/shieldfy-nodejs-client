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

                let requestPath = Client._currentRequest._url.uri;
                let requestParams = Client._currentRequest.getParam();

                // apply file(target: parameters) rules on request parameter
                for(let param in requestParams){

                    let paramValue = requestParams[param]

                    if(path.indexOf(paramValue) !== -1){
                        //Matched YAY
                        paramValue = new Normalizer(path).run();

                        let JudgeParameters = Client._jury.use('files','PARAMETERS');
                        let result = JudgeParameters.execute(paramValue);
                        if(result){
                            var stack = new Error().stack;
                            var codeInfo= StackCollector.stackCollector(stack);
                            var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                            var path= vulnerableLine[1];
                            var lineNumber= parseInt(vulnerableLine[2]);
                            var codeContent= StackCollector.lineCollector(path, lineNumber);
                        
                            // Client._currentRequest.setDanger(true);
                            Client._currentRequest._score += result.score;
                            Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
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
                        var stack = new Error().stack;
                        var codeInfo= StackCollector.stackCollector(stack);
                        var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                        var path= vulnerableLine[1];
                        var lineNumber= parseInt(vulnerableLine[2]);
                        var codeContent= StackCollector.lineCollector(path, lineNumber);
                    
                        Client._currentRequest._score += result.score;
                        Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
                    }
                    
                }

            })

            var returned = original.apply(this, arguments);
            return returned;
        };
    });

    Shimmer.wrap( exports , 'writeFile', function (original) {
        return function (path, data, callback) {

            let allFiles = Client._currentRequest._files;
            
            allFiles.forEach(file => {
                
                // apply rule to file name

                let paramValue = file['originalname']
                
                if(path.indexOf(paramValue) !== -1){

                    //Matched YAY
                    paramValue = new Normalizer(path).run();
                    
                    let JudgeParameters = Client._jury.use('files','FILENAME');
                    let result = JudgeParameters.execute(paramValue);
                    if(result){
                        var stack = new Error().stack;
                        var codeInfo= StackCollector.stackCollector(stack);
                        var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                        var path= vulnerableLine[1];
                        var lineNumber= parseInt(vulnerableLine[2]);
                        var codeContent= StackCollector.lineCollector(path, lineNumber);
                    
                        Client._currentRequest._score += result.score;
                        Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
                    }
                    
                }
                    
            });

            // apply rule to file content
            var fileContent = data.toString();

            fileContent = new Normalizer(fileContent).run();

            let JudgeParameters = Client._jury.use('files','CONTENT');
            let result = JudgeParameters.execute(fileContent);
            if(result){
                var stack = new Error().stack;
                var codeInfo= StackCollector.stackCollector(stack);
                var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                var path= vulnerableLine[1];
                var lineNumber= parseInt(vulnerableLine[2]);
                var codeContent= StackCollector.lineCollector(path, lineNumber);
            
                Client._currentRequest._score += result.score;
                Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
            }

            
            var returned = original.apply(this, arguments);
            return returned;
        };
    });

    Shimmer.wrap( exports , 'readFileSync', function (original) {
        
        return function (path, encoding) {

            try{

                let requestPath = Client._currentRequest._url.uri;
                let requestParams = Client._currentRequest.getParam();
                
                // apply file(target: parameters) rules on request parameter
                for(let param in requestParams){

                    let paramValue = requestParams[param]
                    
                    if(path.indexOf(paramValue) !== -1){
                        //Matched YAY
                        paramValue = new Normalizer(path).run();
                        let JudgeParameters = Client._jury.use('files','PARAMETERS');
                        let result = JudgeParameters.execute(paramValue);
                        if(result){
                            var stack = new Error().stack;
                            var codeInfo= StackCollector.stackCollector(stack);
                            var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                            var path= vulnerableLine[1];
                            var lineNumber= parseInt(vulnerableLine[2]);
                            var codeContent= StackCollector.lineCollector(path, lineNumber)
                        
                            Client._currentRequest._score += result.score;
                            Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
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
                        var stack = new Error().stack;
                        var codeInfo= StackCollector.stackCollector(stack);
                        var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                        var path= vulnerableLine[1];
                        var lineNumber= parseInt(vulnerableLine[2]);
                        var codeContent= StackCollector.lineCollector(path, lineNumber);
                    
                        Client._currentRequest._score += result.score;
                        Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
                    }
                
                }
            }catch(e){}
                
            var returned = original.apply(this, arguments);
            return returned;
        };
    });

    Shimmer.wrap( exports , 'writeFileSync', function (original) {
        
        return function (path, data) {
            let allFiles = Client._currentRequest._files;
            
            allFiles.forEach(file => {
                
                // apply rule to file name                    
                let paramValue = file['originalname']
                
                if(path.indexOf(paramValue) !== -1){

                    //Matched YAY
                    paramValue = new Normalizer(path).run();
                    
                    let JudgeParameters = Client._jury.use('files','FILENAME');
                    let result = JudgeParameters.execute(paramValue);
                    if(result){
                        var stack = new Error().stack;
                        var codeInfo= StackCollector.stackCollector(stack);
                        var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                        var path= vulnerableLine[1];
                        var lineNumber= parseInt(vulnerableLine[2]);
                        var codeContent= StackCollector.lineCollector(path, lineNumber);
                    
                        Client._currentRequest._score += result.score;
                        Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
                    }
                    
                }
                    
            });

            // apply rule to file content
            var fileContent = data.toString();

            fileContent = new Normalizer(fileContent).run();

            let JudgeParameters = Client._jury.use('files','CONTENT');
            let result = JudgeParameters.execute(fileContent);
            if(result){
                var stack = new Error().stack;
                var codeInfo= StackCollector.stackCollector(stack);
                var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                var path= vulnerableLine[1];
                var lineNumber= parseInt(vulnerableLine[2]);
                var codeContent= StackCollector.lineCollector(path, lineNumber);
            
                Client._currentRequest._score += result.score;
                Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
            }

            
            var returned = original.apply(this, arguments);
            return returned;
        };
    });

    Shimmer.wrap( exports , 'createReadStream', function (original) {
        return function (path) { 

            // this try catch statement for unit test perpose
            try {
                // apply rules on file name
                let requestParams = Client._currentRequest.getParam();
                let requestPath = Client._currentRequest._url.uri;
                
                for(let param in requestParams){
                    
                    let paramValue = requestParams[param]

                    if(path.indexOf(paramValue) !== -1){
                        //Matched YAY
                        paramValue = new Normalizer(path).run();

                        let JudgeParameters = Client._jury.use('files','PARAMETERS');
                        let result = JudgeParameters.execute(paramValue);
                        if(result){
                            var stack = new Error().stack;
                            var codeInfo= StackCollector.stackCollector(stack);
                            var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                            var path= vulnerableLine[1];
                            var lineNumber= parseInt(vulnerableLine[2]);
                            var codeContent= StackCollector.lineCollector(path, lineNumber);
                        
                            Client._currentRequest._score += result.score;
                            Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
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
                        var stack = new Error().stack;
                        var codeInfo= StackCollector.stackCollector(stack);
                        var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                        var path= vulnerableLine[1];
                        var lineNumber= parseInt(vulnerableLine[2]);
                        var codeContent= StackCollector.lineCollector(path, lineNumber);
                    
                        Client._currentRequest._score += result.score;
                        Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
                    }
                    
                }
            
            }catch(e){

            }
                    
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    Shimmer.wrap( exports , 'createWriteStream', function (original) {
        return function (path) { 
            
            let allFiles = Client._currentRequest._files;
            
            allFiles.forEach(file => {
                
                // apply rule to file name

                let paramValue = file['originalname']
                
                if(path.indexOf(paramValue) !== -1){

                    //Matched YAY
                    paramValue = new Normalizer(path).run();
                    
                    let JudgeParameters = Client._jury.use('files','FILENAME');
                    let result = JudgeParameters.execute(paramValue);
                    if(result){
                        var stack = new Error().stack;
                        var codeInfo= StackCollector.stackCollector(stack);
                        var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                        var path= vulnerableLine[1];
                        var lineNumber= parseInt(vulnerableLine[2]);
                        var codeContent= StackCollector.lineCollector(path, lineNumber);
                    
                        Client._currentRequest._score += result.score;
                        Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
                    }
                    
                }
                    
            });


            // apply rule to file content
            Shimmer.wrap( this , 'write', function (original) {
                return function () { 
                    var fileContent = arguments[1].toString();

                    fileContent = new Normalizer(fileContent).run();

                    let JudgeParameters = Client._jury.use('files','CONTENT');
                    let result = JudgeParameters.execute(fileContent);
                    if(result){
                        var stack = new Error().stack;
                        var codeInfo= StackCollector.stackCollector(stack);
                        var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                        var path= vulnerableLine[1];
                        var lineNumber= parseInt(vulnerableLine[2]);
                        var codeContent= StackCollector.lineCollector(path, lineNumber);
                    
                        Client._currentRequest._score += result.score;
                        Client.sendToJail('file', result, codeContent, lineNumber, path, codeInfo);
                    }

                    
                    var returned = original.apply(this, arguments);
                    return returned;
                }
        
            });
            
            
            var returned = original.apply(this, arguments);
            return returned;
        }

    });

    return exports;
}

module.exports = new fileMonitor;