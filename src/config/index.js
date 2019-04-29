function Config() {
    this._defaults = {
      "sdkVersion": "0.5.1",
      "endPoint": 'https://api.shieldfy.com/v2/',
      "appKey": null,
      "appSecret": null,
      "signature": null,
      "debug": false,
      "action": "block",
      "blockPage": null,
    };
}

Config.prototype.setConfig = function (opts)
{
    if ( process.env.shieldfyAppKey !== undefined && process.env.shieldfyAppSecret !== undefined ) {
        var EnvOpts = {
            'appKey':process.env.shieldfyAppKey,
            'appSecret':process.env.shieldfyAppSecret,
            'debug':process.env.shieldfyDebug
        };
        Object.assign(this._defaults,EnvOpts);
    }
    Object.assign(this._defaults,opts);
    return this._defaults;
}


module.exports = Config;
  