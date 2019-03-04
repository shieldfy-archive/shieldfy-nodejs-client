var request = require('request');
var server = require('./expressServer')

describe("request",function () {
    
    it("should be pass",function (done) {
        request.post('http://localhost:3000/request', {form:{key:'value'}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    // TODO: the rules of this monitor need to fix
    it("should be blocked",function (done) {
        request.post('http://localhost:3000/request', {form:{key:'(function(){ })();'}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})
