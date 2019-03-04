var request = require('request');
var server = require('./expressServer')

describe("view request",function () {
    
    it("should be pass",function (done) {
        request.post('http://localhost:3000/view', {form:{key:'value'}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    it("should be blocked",function (done) {
        request.post('http://localhost:3000/view', {form:{key:''}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})
