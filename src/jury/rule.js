function Rule(id, rule)
{
    this._id = id;
    this._target = rule.target;
    this._source = rule.source;
    this._type = rule.type; // Equal | Contain | Preg | RPreg
    this._rule = rule.rule;
    this._normalize = rule.normalize;
    this._score = rule.score;
}

/**
 * run the rule against value
 */
Rule.prototype.run = function(value)
{

    if (this._type == 'EQUAL') {
        var result = this.runEqual(value);
    }
    if (this._type == 'CONTAIN') {
        var result = this.runContain(value);
    }
    if (this._type == 'PREG') {
        var result = this.runPreg(value);
    }
    if (this._type == 'RPREG') {
        var result = this.runRPreg(value);
    }

    if (result) {
        return this.getInfo();
    }
    return false;
}

/**
 * Target parse
 * @param target
 * @return object
*/

/**
 * is value equal
 * @param this target, this rule, this req
 * @return boolean result
 */
Rule.prototype.runEqual = function(value)
{
    if (this._rule.indexOf('|') !== -1) {
        var splitRule = this._rule.split('|');
        for (r in splitRule) {
            if (value === splitRule[r]) {
                return true;
            }
        }
    }

    if (this._rule === value) {
        return true;
    }

    return false;
}

/**
 * is value contain
 * @param this target, this rule, this req
 * @return boolean result
 */
Rule.prototype.runContain = function(value)
{
    if (this._rule.indexOf('|') !== -1) {
        var splitRule = this._rule.split('|');
        for (r in splitRule) {
            if (value.indexOf(splitRule[r]) !== -1) {
                return true;
            }
        }
    }

    if (this._rule.indexOf('|') === -1) {
        if (value !== -1) {
            return true;
        }
    }

    return false;
}

/**
 * PregMatch
 * @param this target, this rule, this req
 * @return boolean result
 */
Rule.prototype.runPreg = function(value)
{
    // var patt = new RegExp(this._rule,'gi');
    var patt = new RegExp(this._rule);
    return patt.test(value);
}

/**
 * Reverse PregMatch
 * @param this target, this rule, this req
 * @return boolean result
 */
Rule.prototype.runRPreg = function(value)
{
    var patt = new RegExp(this._rule);
    // var patt = new RegExp(this._rule,'gi');
    if (patt.test(value) === false) {
        return true;
    }
    return false;
}

Rule.prototype.needNormalize = function()
{
    return this._normalize;
}

/**
 * Get rule info.
 * @return object;
 */
Rule.prototype.getInfo = function()
{
    return {
        id: this._id,
        score: this._score
    };
}

module.exports = Rule;