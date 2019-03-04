var requestCollector = require('../../src/request');
var request = require('request');
var http = require('http');

describe("client",function () {
    var requestInfo
    var responseInfo
    beforeAll(function(done)
    {
        http.createServer(function(req, res)
        {
            requestInfo = req
            responseInfo = res
            done();
            
        }).listen(8000, function() {
            console.log('Listening for requests');
        });
        
        // you can change the request to change the test 
        var j = request.jar();
        var cookie = request.cookie('key1=value1');
        var url = 'http://localhost:8000/request';
        j.setCookie(cookie, url);
        request.post('http://localhost:8000/request', {form:{key:'value'},jar: j})
        
    });
    
    describe("client request",function () {
        var clientRequest
        beforeAll(function(done)
        {
            clientRequest = new requestCollector()
            clientRequest.start(requestInfo, responseInfo,function(){
                done();
            })
            
        });

        it("should return a object",function () {
            expect(typeof(clientRequest)).toBe("object")
        })

        it(".getParam() should return a object",function () {
            expect(typeof(clientRequest.getParam())).toBe("object")
            expect(Object.keys(clientRequest.getParam())[0]).toEqual("key")
            expect(clientRequest.getParam()[Object.keys(clientRequest.getParam())[0]]).toEqual("value")
        })

        it("._score should be number",function () {
            expect(typeof(clientRequest._score)).toBe("number")
        })

        it("._method equal post",function () {
            expect(clientRequest._method).toEqual("POST")
        })

        it("._created to be string",function () {
            expect(typeof(clientRequest._created)).toBe("string")
        })

        it("._headers to be object",function () {
            expect(typeof(clientRequest._headers)).toBe("object")
            expect(clientRequest._headers.host).toEqual('localhost:8000')
            expect(clientRequest._headers['content-type']).toEqual('application/x-www-form-urlencoded')
            expect(clientRequest._headers['content-length']).toEqual('9')
        })

        it("._url to be object",function () {
            expect(typeof(clientRequest._url)).toBe("object")
            expect(clientRequest._url.protocol).toEqual('http')
            expect(clientRequest._url.secure).toEqual(false)
            expect(clientRequest._url.port).toEqual(8000)
            expect(clientRequest._url.uri).toEqual('/request')
        })

        it("._cookies to be object",function () {
            expect(typeof(clientRequest._cookies)).toBe("object")
            expect(clientRequest._cookies).toEqual({ key1: 'value1' })
        })

        it("._query to be object",function () {
            expect(typeof(clientRequest._query)).toBe("object")
        })

        it("._body to be object",function () {
            expect(typeof(clientRequest._body)).toBe("object")
            expect(Object.keys(clientRequest._body)[0]).toEqual("key")
            expect(clientRequest._body[Object.keys(clientRequest._body)[0]]).toEqual("value")
        })

        it("._files to be object",function () {
            expect(typeof(clientRequest._files)).toBe("object")
        })

        it("._ip to be string",function () {
            expect(typeof(clientRequest._ip)).toBe("string")
            expect(clientRequest._ip).toEqual('::ffff:127.0.0.1')
        })

        it("._isDanger to be false",function () {
            expect(clientRequest._isDanger).toEqual(false)
        })

        it("._$req to be object",function () {
            expect(typeof(clientRequest._$req)).toBe("object")
            expect(clientRequest._$req).toEqual(requestInfo)
        })

        it("._$res to be object",function () {
            expect(typeof(clientRequest._$res)).toBe("object")
            expect(clientRequest._$res).toEqual(responseInfo)
        })

    })
    
})