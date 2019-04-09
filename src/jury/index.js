const Rule = require('./rule');

function Jury(Rules)
{
    this._rules = {};

    //build rules objects
    for (const type in Rules) {
        
        let RulesContent = Rules[type];
        this._rules[type] = {};

        for (const RuleId in RulesContent) {
            this._rules[type][RuleId] = new Rule(RuleId,RulesContent[RuleId]);
        }

    }
    
}

Jury.prototype.use = function(use, target ='')
{
    // this section will apply if we won't use all rules of specific type
    // EX: target='CONTENT'
    if (target) {
        var targetedRules = {};
        for (const id in this._rules[use]) {
            if (this._rules[use][id]['_target'] === target) {
                targetedRules[id]=this._rules[use][id];
            }
        }
        return new Judge(targetedRules);
    }

    return new Judge(this._rules[use]);
}


/**
 * New judge for every request(Case)
 * @param Object rules 
 */
function Judge(rules){
    this._rules = rules;
}

/**
 * @param value | string
 * @return result | mixed ( false | Object rule info)
 */
Judge.prototype.execute = function(value)
{
    let result = {
        score: 0,
        rulesIds: []
    };
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

    if(result.score !== 0){
        return result;
    }

    return false; //its clean , return false;
}

module.exports = Jury;