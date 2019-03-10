// var requestCollector = require('../../src/request');
var request = require('request');
var server = require('./expressServer')

describe("mongoDB request",function () {
    
    beforeAll(function(done) {
        setTimeout(() => {
            done();
        }, 2000);
    });
    
    it("should be pass",function (done) {
        request.post('http://localhost:3000/db/mongo', {form:{userName: "user", password: "password"}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    it("should be blocked",function (done) {
        request.post('http://localhost:3000/db/mongo', {form:{userName: "admin' , $or: [ {}, { 'a': 'a", password: "} ], $comment:'successful MongoDB injection"}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})

describe("mysql request",function () {

    beforeAll(function(done) {
        setTimeout(() => {
            done();
        }, 2000);
    });

    it("should be pass",function (done) {
        request.post('http://localhost:3000/db/mysql', {form:{userName: 'user', password: 'password'}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    it("should be blocked",function (done) {
        request.post('http://localhost:3000/db/mysql', {form:{userName: "admin' , $or: [ {}, { 'a': 'a", password: "} ], $comment:'successful MongoDB injection"}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})

