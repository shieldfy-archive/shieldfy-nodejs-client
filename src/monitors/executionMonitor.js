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
        return function (command) { 
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    return exports;
}

module.exports = new executionMonitor;