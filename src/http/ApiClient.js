var request = require('request'),
    CryptoJS = require("crypto-js");

/**
 *
 * @param {this} client
 */
function ApiClient(client) {
    this.appKey = client._config.appKey;
    this.appSecret = client._config.appSecret;
    this.baseUrl = client._config.endPoint;
}

ApiClient.prototype.setupHeader = function(length, hash)
{
    return {
        'Authentication': this.appKey,
        'Authorization':'Bearer ' + hash,
        'Content-Type': 'application/json',
        'Content-Length': length
    };
}

ApiClient.prototype.calculateBodyHash = function(body)
{
    return CryptoJS.HmacSHA256(body, this.appSecret);
}

ApiClient.prototype.request = function(url, body, callback = false)
{
    var options = {
        method: 'POST',
        url: this.baseUrl + url,
        headers: this.setupHeader(JSON.stringify(body).length, this.appSecret),
        json: body
    };


    function callbackRequest(error, response, body) {
        if (error) {
            return false;
        }
        // check the status response of code error
        var statusCodeError = [404, 500];
        if (statusCodeError.includes(response.statusCode)) {
            return false;
        }

        if (body.status == 'error') {
            return false;
        }

        if (callback) {
            callback(body);
            return false;
        }
    }

    request(options, callbackRequest);
}

module.exports = ApiClient;
