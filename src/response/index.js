var path = require('path');
var fs = require('fs');

function Response()
{
    this.valueIncidentId = '';
}

Response.prototype.setIncidentId = function(value)
{
    this.valueIncidentId = value;
}

Response.prototype.block = function()
{
    var viewBlock = fs.readFileSync(path.join(__dirname, '/views/block.html'));
    return viewBlock.toString().replace('{incidentId}', this.valueIncidentId);
}

module.exports = Response;