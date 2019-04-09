const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');

const executionMonitor = function()
{
    this._callbacks = {
        'child_process': this.childProcess,
    }
}

executionMonitor.prototype.run = function(Client)
{
    let Packages = Object.keys(this._callbacks);
    Hook(Packages,  (exports, name, basedir) => {  
        if(this._callbacks.hasOwnProperty(name) ){
            this._callbacks[name](Client, exports, name)
        }
        return exports;
    });
}

executionMonitor.prototype.childProcess = function(Client,exports, name, version)
{
    
    Shimmer.wrap( exports , 'exec', function (original) {
        return function (command, options, callback) { 
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    Shimmer.wrap( exports , 'execSync', function (original) {
        return function (command, options) { 
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    Shimmer.wrap( exports , 'spawn', function (original) {
        return function (command, args, options) { 
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    Shimmer.wrap( exports , 'spawnSync', function (original) {
        return function (command, args, options) { 
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    Shimmer.wrap( exports , 'execFile', function (original) {
        return function (file, args, options, callback) { 
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    return exports;
}

module.exports = new executionMonitor;