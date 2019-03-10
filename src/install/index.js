var crypto = require("crypto");

function Install(client, callback)
{
    this.client = client;
    this.api = client._http._api;
    this.run(client, callback);
}

Install.prototype.run = function(client, callback = false)
{
    this.api.trigger('install', {
        host: this.client._config.endPoint,
        https: '1',
        lang: 'nodeJs',
        sdk_version: this.client._config.sdkVersion,
    },function(body){
        if (body.status == "error") {
            // try to redownload rules
            client._install.run(client, callback)
        } else {
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
        }
    });
}


module.exports = Install;