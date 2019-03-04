var ApiClient = require('./ApiClient');

function Dispatcher(client)
{
    this.api = new ApiClient(client);
    this.events = [
        'install',
        'update',
        'update/vendors',
        'session/start',
        'session/step',
        'session/threat',
        'security/scan',
        'exception',
        'ping',
        'dependents'
    ];
}

Dispatcher.prototype.trigger = function(event, data = [], callback = false)
{
    if (!this.events.includes(event)) {
        return false;
    }
    this.api.request(event, data, callback);
}

module.exports = Dispatcher;