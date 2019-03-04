var Config = require('../../src/config');

describe("Config",function () {

    it("with parameter",function () {
        opts = {
            appKey:'testKey',
            appSecret:'testSecret',
            endPoint:'http://endpoint/'
        }
        config = new Config().setConfig(opts);
        expect(config.appKey).toEqual("testKey")
        expect(config.appSecret).toEqual("testSecret")
    })

    it("without parameter",function () {
        opts = {}
        config = new Config().setConfig(opts);
        expect(config.appKey).toEqual(null)
        expect(config.appSecret).toEqual(null)
    })

    it("with environment parameter",function () {
        setTimeout(function() {
            require('dotenv/config');
            config = new Config().setConfig({});
            expect(config.appKey).toEqual("test environment key")
            expect(config.appSecret).toEqual("test environment secret")
        }, 1000);
    })


})