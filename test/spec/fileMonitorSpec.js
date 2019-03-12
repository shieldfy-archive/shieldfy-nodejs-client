var request = require('request');
var server = require('./expressServer')
var fs = require('fs');

describe("readFile request",function () {

    beforeAll(function(done) {
        setTimeout(() => {
            done();
        }, 2000);
    });
    
    it("should be pass",function (done) {
        request.post('http://localhost:3000/file/readFile', {form:{key:'testFile'}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    it("should be blocked",function (done) { 
        request.post('http://localhost:3000/file/readFile', {form:{key:'../../etc/passwd'}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})

describe("writeFile request",function () {

    beforeAll(function(done) {
        setTimeout(() => {
            done();
        }, 2000);
    });
    
    it("should be pass",function (done) {
        request.post('http://localhost:3000/file/writeFile'
        , {formData:{my_file: fs.createReadStream(__dirname + '/testFiles/testFile.txt')}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    it("should be blocked",function (done) {
        request.post('http://localhost:3000/file/writeFile'
        , {formData:{my_file: fs.createReadStream(__dirname + '/testFiles/dangerousTestFile.js')}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})

describe("readFileSync request",function () {

    beforeAll(function(done) {
        setTimeout(() => {
            done();
        }, 2000);
    });
    
    it("should be pass",function (done) {
        request.post('http://localhost:3000/file/readFileSync', {form:{key:'testFile.txt'}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    it("should be blocked",function (done) {
        request.post('http://localhost:3000/file/readFileSync', {form:{key:'../../etc/passwd'}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})

describe("writeFileSync request",function () {

    beforeAll(function(done) {
        setTimeout(() => {
            done();
        }, 2000);
    });
    
    it("should be pass",function (done) {
        request.post('http://localhost:3000/file/writeFileSync'
        , {formData:{my_file: fs.createReadStream(__dirname + '/testFiles/testFile.txt')}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    it("should be blocked",function (done) {
        request.post('http://localhost:3000/file/writeFileSync'
        , {formData:{my_file: fs.createReadStream(__dirname + '/testFiles/dangerousTestFile.js')}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})

describe("createReadStream request",function () {

    beforeAll(function(done) {
        setTimeout(() => {
            done();
        }, 2000);
    });
    
    it("should be pass",function (done) {
        request.post('http://localhost:3000/file/createReadStream', {form:{key:'testFile.txt'}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    it("should be blocked",function (done) {
        request.post('http://localhost:3000/file/createReadStream', {form:{key:'../../etc/passwd'}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})

describe("createWriteStream request",function () {

    beforeAll(function(done) {
        setTimeout(() => {
            done();
        }, 2000);
    });
    
    it("should be pass",function (done) {
        request.post('http://localhost:3000/file/createWriteStream'
        , {formData:{my_file: fs.createReadStream(__dirname + '/testFiles/testFile.txt')}}, function(err,res,body){
            expect(body).toEqual("hello world")
            done();
        })
    })

    it("should be blocked",function (done) {
        request.post('http://localhost:3000/file/createWriteStream'
        , {formData:{my_file: fs.createReadStream(__dirname + '/testFiles/dangerousTestFile.js')}}, function(err,res,body){
            expect(body).not.toEqual("hello world")
            done();
        })
    })
    
})