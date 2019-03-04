function Config() {
    this._defaults = {
      "sdkVersion": "0.1.0",
      "endPoint": 'https://api.shieldfy.com/v2/',
      "appKey": null,
      "appSecret": null,
      "debug": false,
      "action": "block",
      "blockPage": null,
    };
}

Config.prototype.setConfig=function (opts) {

    if (process.env.appKey !== undefined && process.env.appSecret !== undefined) {

        var EnvOpts={
            'appKey':process.env.appKey,
            'appSecret':process.env.appSecret,
            'debug':process.env.debug
        }

        Object.assign(this._defaults,EnvOpts);
    }

    Object.assign(this._defaults,opts);
    return this._defaults;
}


module.exports = Config;
  