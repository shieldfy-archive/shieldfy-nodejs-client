var dispatcher = require('./Dispatcher');

function Http(client)
{
    this._api = new dispatcher(client);
}

module.exports = Http;