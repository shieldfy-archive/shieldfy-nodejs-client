const Session = require('./session');
const Monitors = require('./monitors');
const Config = require('./config');
const Http = require('./http');
const Jury = require('./jury');
const Response = require('./response');
const uuid = require('uuid');
const Install = require('./install');
const Helpers = require('./helpers');

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

    this._sessionId = uuid.v4();
    
    // collect information about client to use it with the api
    var stackObj = {}
    Error.captureStackTrace(stackObj)
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
        startTrace: stackObj.stack.split(/\n */).slice(1),
        main: pkg && pkg.main,
        dependencies: pkgLock ? JSON.stringify(pkgLock.dependencies) : pkg && pkg.dependencies,
        conf: this._config
    };


    
    //initiate the HTTP client to communicate with the API
    this._http = new Http(this);
        
    this._session = new Session(this);
    
    this._monitors = new Monitors(this);

    this._jury = new Jury({});
    // send to api that is a new installation
    this._install= new Install(this, function(self, rules){
        self._jury = new Jury(rules);
    });

    // useing this response when need to block a request 
    this._response = new Response();


}

Client.prototype.sendToJail = function()
{
    if(this._currentRequest._score >= 70){
        this._currentRequest.setDanger(true);
    }

    let incidentId = uuid.v4();
    this._response.setIncidentId(incidentId);    
}

Client.prototype.reportThreat = function(monitor, result, codeInfo)
{
    // send threat to the api
    this._http._api.trigger('session/threat', {
        incidentId: this._response.valueIncidentId,
        host: this._currentRequest._headers.host,
        sessionId: this._sessionId,
        monitor: monitor,
        severity: parseScore(result.score),
        charge: {
            'rulesIds':result.rulesIds
        },
        request: {
            method: this._currentRequest._method,
            uri: this._currentRequest._url.uri,
            get: this._currentRequest._query,
            post: this._currentRequest._body,
            created: this._currentRequest._created
        },
        user: {
            id: this._currentRequest._id,
            ip: this._currentRequest._ip,
            userAgent: this._currentRequest._headers['user-agent'],
            score: this._currentRequest._score,
        }, 
        code: {
            stack: [],
            code: {
                file: codeInfo.path,
                line: codeInfo.lineNumber,
                content: codeInfo.code
            }
        },
        response: parseScore(result.score) === 'high'? 'block' : 'pass',
        lang: 'nodejs'
    });
}
function parseScore(score = 0)
{
    if (score >= 70) {
        return 'high';
    }
    if (score >= 40) {
        return 'med';
    }
    return 'low';
}

module.exports = Client;