

const Block = function()
{
    this.blockScreen = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Access Denied</title></head><body style="background: #2f323b;font-family:sans-serif;"><div style="text-align:center;color:#fff;"><img style="width:150px;" src="https://cloud.shieldfy.io/img/logoi.png" alt=""><h1>Whooops!</h1><p>Your request blocked for security reasons</p><p>if you believe that your request shouldn\'t be blocked contact the administrator <br /><br /><br /> Incident ID : <id>{incidentId}</id> </p><hr/>Protected By <a style="color:#fff" href="https://shieldfy.io" target="_blank">Shieldfy</a> &trade; Web Shield </div></body></html>';
}

Block.prototype.run = function(incidentId, res)
{
    if(res.finished) {
        console.log('request is finished');
        return false; // request is alredy finished
    }

    res.writeHead(403);
    res.write(this.blockScreen.replace('{incidentId}', incidentId));
    res.end();
    res.finished = true;

    return true;
}


module.exports = function(incidentId,res){
    return new Block().run(incidentId,res);
};