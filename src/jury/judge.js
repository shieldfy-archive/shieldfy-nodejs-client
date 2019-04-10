const uuidv4 = require('uuid/v4');
const StackCollector = require('../collectors/stackCollector');
const BLOCKTHREHOLD = 70;

/**
 * New judge for every request(Case)
 * @param string monitor
 * @param Object rules
 * @param Object request
 * @param Object http
 */
function Judge(monitor, rules, request, http) {
    this._monitorName = monitor;
    this._rules = rules;
    this._currentRequest = request;
    this._http = http;

    this._incidentId = '';
    this._result = {
        score: 0,
        rulesIds: []
    };
}

/**
 * @param value | string
 * @return result | boolean
 */
Judge.prototype.execute = function(value)
{
    let result = {
        score: 0,
        rulesIds: []
    }

    //iterate the rules in use
    for (rule in this._rules) {

        let _rule = this._rules[rule];
        //run the rule
        let ruleInfo = _rule.run(value);
        if (ruleInfo) {
            result.score += parseInt(ruleInfo.score);
            result.rulesIds.push(ruleInfo.id);
        }
    }

    if(result.score >= BLOCKTHREHOLD){
        this._result = result;
        this._incidentId = uuidv4();
        return true; //infected , dangerous
    }

    return false; //its clean , return false;
}


Judge.prototype.sendToJail = function(stack)
{
    this._currentRequest.setDanger(true);
    this._currentRequest.end(this._incidentId);
    StackCollector.parse(stack,(codeInfo) => {  
        this.reportThreat(codeInfo);
    });
}

Judge.prototype.reportThreat = function(codeInfo)
{
    this._http.trigger('session/threat', {
        incidentId: this._incidentId,
        host: this._currentRequest._headers.host,
        sessionId: this._currentRequest._sessionId,
        monitor: this._monitorName,
        severity: parseScore(this._result.score),
        charge: {
            'rulesIds':this._result.rulesIds
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
        response: parseScore(this._result.score) === 'high'? 'block' : 'pass',
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


module.exports = Judge;