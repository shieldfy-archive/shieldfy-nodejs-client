var dispatcher = require('./Dispatcher');

module.exports = function(client){
    return new dispatcher(client);
};