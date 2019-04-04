'use strict';

var util = require('util');
const Hook = require('require-in-the-middle');
const semver = require('semver')
const Shimmer = require('shimmer');
const Normalizer = require('../normalizer');
const StackCollector = require('../stackCollector');

const expressMonitor = function()
{
    this._callbacks = {
        'compression': this.compression,
    }
}


// Hook('compression', (exports, name, basedir) => { 
//     var cmpmiddle = exports.apply(this,arguments);
//     return (req,res,next) => {
//         var x = cmpmiddle(req,res,function(){
//             _write = res.w;
//             res.w = ();
//             next();
//         });
//     }
// });

expressMonitor.prototype.run = function(Client)
{
    let Packages = Object.keys(this._callbacks);
    Hook(Packages,  (exports, name, basedir) => {  
        if(this._callbacks.hasOwnProperty(name) ){
            this._callbacks[name](Client, exports, name);
        }
        return exports;
    });
}

expressMonitor.prototype.compression = function(Client,exports, name, version)
{
    console.log('====================================');
    console.log("");
    console.log('====================================');
    // var cmpmiddle = exports.apply(this,[{filter : function(){return true;}}]);
    // return function newCtor(options){
    //     var encoder = (req,res,next) => {
    //         console.log(res);
    //         var x = cmpmiddle(req,res,function() {
    //             let _write = res.write;
    //             res.write = function(chun){
    //                 console.log('====================================');
    //                 console.log("SHIELDFY HERE");
    //                 console.log(arguments);
    //                 console.log('====================================');
    //                 return _write.apply(this,arguments)
    //             };
    //             next();
    //         });
    //         let _write = res.write;
    //             res.write = function(chun){
    //                 console.log('====================================');
    //                 console.log("SHIELDFY HERE");
    //                 console.log(arguments);
    //                 console.log('====================================');
    //                 return _write.apply(this,arguments)
    //             };
    //         return encoder;
    // }}
    return function(){console.log("wrapped")}
    // return exports;
}

module.exports = new expressMonitor;