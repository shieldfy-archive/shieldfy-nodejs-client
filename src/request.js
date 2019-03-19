const url = require('url');
const cookie = require('cookie');
const uuid = require('uuid');
const Busboy = require('busboy');
const { parse } = require('querystring');
function Request()
{
    this._id = uuid.v4();

    this._statusCode = null; //the status code extracted from the response;
    // score of the request
    this._score = 0; //current request score
    this._method = null; //current request http method
    this._created = null; //current request timestamp
    this._headers = {}; //crrent request headers
    this._url = {}; //URL { protocol , secure , port , URI}
    this._cookies = {}; // request cookies
    this._query = {};  // QueryString
    this._body = {}; // POST Body 
    this._files = []; // Uploaded Files  
    this._ip = null;

    this._$req = null; //the full request object
    this._$res = null; //the full response object 

    this._isDanger = false; //Is the request dangerous 
    
}

Request.prototype.start = function(req, res, cb = false)
{
    this._$res = res;
    this._$req = req;
    this._method = req ? req.method : '';
    let date = Math.ceil(Date.now()/1000)
    this._created = req ? date:'';
    this._headers = req ? req.headers : '';
    this._url = req ? this._extractUrl(req) : '';
    this._cookies = req ? cookie.parse(req.headers.cookie || '') : '';
    this._query = req ? url.parse(req.url, true).query : '';
    this._ip = req ? this.getIp(req):'';

    if (req.method != "GET" && req.method != "HEAD" && req.method != "OPTIONS") {
        //extract files and body of data from the request
        if(req && req.headers["content-type"])
        {
            this._getPostData(req,() => {
                if(cb){
                    cb();
                }
            })
        }
    }

}

Request.prototype.getIp = function(req)
{
    try {
        if (req.headers === undefined){
            throw "request does not has a headers"
        }else{
            var xff = req.headers['x-forwarded-for'];
        }
    
        var ip = req.connection.remoteAddress;
    
        if (xff) {
            if (xff != ip) {
                return ip;
            }
        }
        return ip;
    } catch(e) {}
}

Request.prototype._getPostData = function(req,cb)
{
    
    // check if the content type is multipart/form-data
    if(req.headers["content-type"].indexOf("multipart/form-data") !== -1)
    {
        // TRUE: case of multipart/form-data
        this._prepareFormData(req,(formData) =>
        {
            this._files = formData.files;
            this._body = formData.fields;
            cb();
        });
    }
    else
    {
        // FALSE: case not multipart/form-data
        this._preparePostData(req,(postData) =>
        {
            this._body = postData
            cb();
        });
    }
}

/**
 * extract the data from the form-data
 * 
 * @param {object} req 
 * @param {function} cb 
 */
Request.prototype._prepareFormData = function(req,cb)
{
    formData = {
        files:[],
        fields:{}
    }

    try{ //use this to avoid unexpected Busboy exceptions: ex: invalid multipart headers
        let busboy = new Busboy({ headers: req.headers });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype)
        {
            let size=0;
            let fileContent = []
            file.on('data', function(data)
            {
                fileContent += data.toString();
                size+=data.length
            });

            file.on('end', function()
            {
                let extractedFile={
                    "fieldname":fieldname,
                    "originalname":filename,
                    "encoding":encoding,
                    "mimetype":mimetype,
                    "size":size,
                    "content":fileContent
                }            
                formData.files.push(extractedFile);
            });
        });

        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated)
        {
            formData.fields[fieldname]=val
        });

        busboy.on('finish', function()
        {
            cb(formData);
        });

        req.pipe(busboy);
    }catch(e){ }
    
}

/**
* extract the data from the POST

 * @param {object} req 
 * @param {function} cb 
 */
Request.prototype._preparePostData = function(req,cb)
{
    let postData = '[]';
    req.on('data', function(chunk)
    {
        postData += chunk.toString();
    });

    req.on('end', function ()
    {
        if ( req.headers["content-type"].indexOf("application/json") !== -1 ) {
            // case content-type is application/json
            if (postData) {
                try {
                    cb(JSON.parse(postData));
                } catch (e) {
                    // in case application/json but data application/x-www-form-urlencoded format
                    cb(parse(postData));
                }
            }
        }else{
            // case content-type is application/x-www-form-urlencoded
            cb(parse(postData));
        }
    });
}

Request.prototype._extractUrl = function(req)
{
    let queryString = url.parse(req.url,true);  
    return {
        protocol : req.connection.encrypted ? 'https': 'http',
        secure : req.connection.encrypted ? true: false,
        port : req.connection.localPort,        
        uri : queryString.href
    };
}


Request.prototype.setRes = function(res)
{
    this._$res = res;
    this._statusCode = res ? res.statusCode : '';
}


Request.prototype.setDanger = function(status)
{
    this._isDanger = status;   
}

Request.prototype.isDanger = function()
{
    return this._isDanger;
}


Request.prototype.end = function()
{

}

Request.prototype.getParam = function()
{
    let params = {};

    Object.assign(params, this._body, this._query);
    return params
}

module.exports = Request;
