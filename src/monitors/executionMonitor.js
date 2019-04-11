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
            if (wrapExecution(Client, command)) {
                command = "SHIELDFY";
                // return;
            }
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    Shimmer.wrap( exports , 'execSync', function (original) {
        return function (command, options) { 
            if (wrapExecution(Client, command)) {
                command = "SHIELDFY";
                // return;
            }
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    Shimmer.wrap( exports , 'spawn', function (original) {
        return function (command, args, options) { 
            // use args in applying rules
            if (wrapExecution(Client, command)) {
                command = "SHIELDFY";
                // return;
            }
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    Shimmer.wrap( exports , 'spawnSync', function (original) {
        return function (command, args, options) { 
            // use args in applying rules
            if (wrapExecution(Client, command)) {
                command = "SHIELDFY";
                // return;
            }
            
            var returned = original.apply(this, arguments);
            return returned;
        }
    });

    return exports;
}

function wrapExecution(Client, command)
{
    if (Client._currentRequest) {
        let requestParams = Client._currentRequest.getParam();

        if (!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)) {
            
            for (let param in requestParams) {
                let paramValue = requestParams[param];
                if (command.indexOf(paramValue) !== -1) {
                    //Matched YAY                            
                    let Judge = Client._jury.use('rce');
                    if (Judge.execute(paramValue)) {
                        Judge.sendToJail(new Error().stack);
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

module.exports = new executionMonitor;