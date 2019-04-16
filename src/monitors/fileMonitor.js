const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Normalizer = require('../normalizer');

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
        if (this._callbacks.hasOwnProperty(name) ) {
            this._callbacks[name](Client, exports, name)
        }
        return exports;
    });
}

fileMonitor.prototype.handleFile = function(Client,exports, name, version)
{
    Shimmer.wrap( exports , 'readFile', function (original) {
        return function (path, callback) {
            original(path,'utf8',function(err,data) {
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

    // Shimmer.wrap( exports , 'writeFile', function (original) {
    //     return function (path, data, callback) {
    //         wrapWrite(path, data, Client);
    //         var returned = original.apply(this, arguments);
    //         return returned;
    //     };
    // });
    
    // Shimmer.wrap( exports , 'writeFileSync', function (original) {
    //     return function (path, data) {
    //         wrapWrite(path, data, Client);
    //         var returned = original.apply(this, arguments);
    //         return returned;
    //     };
    // });

    // Shimmer.wrap( exports , 'createWriteStream', function (original) {
    //     return function (path) { 
    //         if (Client._currentRequest) {
    //             let allFiles = Client._currentRequest._files;
    //             if (allFiles.length > 0) {
    //                 allFiles.forEach(file => {
    //                     // apply rule to file name
    //                     let paramValue = file['originalname']
    //                      // replace index of by isParamInPath
    //                     if (path.indexOf(paramValue) !== -1) {
    //                         //Matched YAY
    //                         paramValue = new Normalizer(paramValue).run();
    //                         let Judge = Client._jury.use('files','FILENAME');
    //                         if (Judge.execute(paramValue)) {
    //                             Judge.sendToJail();
    //                         }
    //                     }
    //                 });
    //             }
    //             // apply rule to file content
    //             Shimmer.wrap( this , 'write', function (original) {
    //                 return function () { 
    //                     var fileContent = arguments[1].toString();
    //                     if (fileContent) {
    //                         fileContent = new Normalizer(fileContent).run();
    //                         let Judge = Client._jury.use('files','CONTENT');
    //                         if (Judge.execute(fileContent)) {
    //                             Judge.sendToJail();
    //                         }
    //                     }
    //                     var returned = original.apply(this, arguments);
    //                     return returned;
    //                 }
    //             });   
    //         }
    //         var returned = original.apply(this, arguments);
    //         return returned;
    //     }
    // });
    return exports;
}

/**
 * @description Tries to detect whether a parameter is controlling the path provided to an fs function
 * .
 * .
 * .
 * @param {String} param the parameter provided by the user
 * @param {String} path the path provided to the fs function
 * .
 * .
 * @TODO :
 *  - Detect base64 encoded params (base64 decode then check range of charCode, 
 *    if all is inside UTF-8 then it was probably encoded).
 * 
 *  - 
 * .
 */
function isParamInPath(param, path){

    let MATCHED = false;

    if(typeof(param) == "string" && typeof(path) == "string"){

        let paramArr, pathArr;
        
        //We split path into pieces by splitting on path seperators ("/" and "\")

        if(process.platform == "win32"){

            //Windows supports both back and forward slashes as path seperators
            paramArr = param.split(/\/|\\/);
            pathArr = path.split(/\/|\\/);

        }
        else{

            paramArr = param.split('/');
            pathArr = path.split('/');

        }

        //splitting on slashes can lead to empty strings '' in the array if the first character is a slash, 
        //so we remove it
        paramArr = paramArr.filter(dir => dir != '');
        pathArr = pathArr.filter(dir => dir != '');

        //Ex: path=/etc/passwd , param = /etc/passwd
        if(path.indexOf(param) != -1){
            MATCHED = true;
        };

        //Ex: path = /etc/passwd , param = /something/somethingelse/etc/passwd
        paramArr.forEach(param => {
            if(pathArr.includes(param)){
                MATCHED = true;
            };
        });

        //Ex: path=/etc/passwd , param=...someotherdata...etc...passwd...moredata
        pathArr.forEach(dir => {
            if(param.indexOf(dir) != -1){
                MATCHED = true
            };
        });

    }

    return MATCHED;
}

function wrapRead(path, Client)
{
    if (path.indexOf('shieldfy-nodejs-client') !== -1) {
        return
    }
    
    if (Client._currentRequest) {
        let requestPath = Client._currentRequest._url.uri;
        let requestParams = Client._currentRequest.getParam();
        if (requestPath || !(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
            // apply file(target: parameters) rules on request parameter
            for (let param in requestParams) {
                let paramValue = requestParams[param];
                if (isParamInPath(paramValue, path)) {
                    //Matched YAY
                    paramValue = new Normalizer(paramValue).run();
                    let Judge = Client._jury.use('files','PARAMETERS');
                    if (Judge.execute(paramValue)) {
                        Judge.sendToJail();
                    }
                }
            }
            // apply file(target: url) rules on uri
            // shall i replace indexOf by isParamInPath
            if (path.indexOf(requestPath) !== -1) {
                //Matched YAY
                paramValue = new Normalizer(requestPath).run();
                let Judge = Client._jury.use('files', 'URL');
                if (Judge.execute(paramValue)) {
                    Judge.sendToJail();
                }
            }
        }
    }
}

// function wrapWrite(path, data, Client){
//     if (Client._currentRequest) {
//         let allFiles = Client._currentRequest._files;
//         if (allFiles.length > 0) {
//             allFiles.forEach(file => {
//                 // apply rule to file name
//                 let paramValue = file['originalname']
//                 if (isParamInPath(paramValue, path)) {
//                     //Matched YAY
//                     paramValue = new Normalizer(paramValue).run();
//                     let Judge = Client._jury.use('files','FILENAME');
//                     if (Judge.execute(paramValue)) {
//                         Judge.sendToJail();
//                     }
//                 }
//             });
//         }
//         // apply rule to file content
//         var fileContent = data.toString();
//         if (fileContent) {
//             fileContent = new Normalizer(fileContent).run();
//             let Judge = Client._jury.use('files','CONTENT');
//             if (Judge.execute(fileContent)) {
//                 Judge.sendToJail();
//             }
//         }
//     }
// }

module.exports = new fileMonitor;