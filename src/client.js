const Session = require('./session');
const Monitors = require('./monitors');
const Config = require('./config');
const Http = require('./http');
const Jury = require('./jury');
const uuidv4 = require('uuid/v4');
const Install = require('./install');
const Helpers = require('./helpers');
const path = require('path');

function Client ()
{
    this._currentRequest = null;
    this._config = null;
    this._rules = null;
    this._sessionId = null;
    this._session = null;
    this._monitors = null;
    this._jury = null;
}


Client.prototype.start = function(opts)
{
    //initiate the config and merge with default configurations
    this._config = new Config().setConfig(opts);
    this._sessionId = uuidv4();
    
    // collect information about client to use it with the api
    var baseDir = Helpers.baseDir(new Error());
    try {
        var pkg = require(path.join(baseDir, 'package.json'));
        var pkgLock = require(path.join(baseDir, 'package-lock.json'));
    } catch (e) {}

    this._info = {
        pid: process.pid,
        ppid: process.ppid,
        arch: process.arch,
        platform: process.platform,
        node: process.version,
        main: pkg && pkg.main,
        dependencies: pkgLock ? JSON.stringify(pkgLock.dependencies) : pkg && pkg.dependencies,
        conf: this._config
    };


    
    //initiate the HTTP client to communicate with the API
    this._http = new Http(this);
        
    this._session = new Session(this);
    
    this._monitors = new Monitors(this);

    this._jury = new Jury(this, {}); //init jury without rules at first
    
    // send to api that is a new installation
    Install(this, (rules) => {
        this._jury = new Jury(this, rules);
    });

}

Client.prototype.reportException = function(codeInfo, message)
{
    // send exception to the api
    this._http._api.trigger('exception', {
        code: codeInfo.code,
        file: codeInfo.path,
        line: codeInfo.lineNumber,
        message: message,
        old: '',
    });
}


module.exports = Client;