var path = require('path')
function _getCallerFile(err) {
    var defaultPrepareStackFunc = Error.prepareStackTrace;
    try {
        
        var callerfile = undefined;
        var currentfile;

        Error.prepareStackTrace = function (err, stack) { return stack; };

        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            callerfile = err.stack.shift().getFileName();         
            if(currentfile !== callerfile) break;
        }
    } catch (err) {}

    Error.prepareStackTrace = defaultPrepareStackFunc;
    return callerfile;
}

function _getBaseDir(err)
{
    var baseDir = _getCallerFile(err);
    if(baseDir === undefined) baseDir = __dirname + '/../../';
    return path.dirname(baseDir);
}

module.exports = {
    'baseDir' : _getBaseDir
}