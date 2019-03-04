var crypto = require("crypto");

function Install(client, callback)
{
    this.client = client;
    this.api = client._http._api;
    var rules = client._rules;
    this.run(client, rules, callback);
}

Install.prototype.run = function(client, rules, callback = false)
{
    this.api.trigger('install', {
        host: this.client._config.endPoint,
        https: '1',
        lang: 'nodeJs',
        sdk_version: this.client._config.sdkVersion,
    },function(body){
        var allRules = body.data.rules;

        // Decode the rules and parse it
        for(type in allRules){
            if(allRules[type] !== ''){
                allRules[type] = JSON.parse(Buffer.from(allRules[type], 'base64').toString('ascii'));
            }
        }

        if (callback != false) {
            callback(client, allRules);
        }

    });
}


module.exports = Install;