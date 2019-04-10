const Rule = require('./rule');
const Judge = require('./judge');

function Jury(Client,Rules)
{
    this._rules = {};
    this._client = Client;
    //build rules objects
    for (const type in Rules) {
        
        let RulesContent = Rules[type];
        this._rules[type] = {};

        for (const RuleId in RulesContent) {
            this._rules[type][RuleId] = new Rule(RuleId,RulesContent[RuleId]);
        }
        //console.log('RR',this._rules);

    }
    
}

Jury.prototype.use = function(monitor, target ='')
{
    // this section will apply if we won't use all rules of specific type
    // EX: target='CONTENT'
    if (target) {
        var targetedRules = {};
        for (const id in this._rules[monitor]) {
            if (this._rules[monitor][id]['_target'] === target) {
                targetedRules[id]=this._rules[monitor][id];
            }
        }
       // console.log('TR'+monitor,targetedRules);
        return new Judge(monitor,targetedRules,this._client._currentRequest,this._client._http);
    }

    return new Judge(monitor,this._rules[monitor],this._client._currentRequest,this._client._http);
}

module.exports = Jury;