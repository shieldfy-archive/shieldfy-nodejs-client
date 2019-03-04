var Normalizer = require('../../src/normalizer');

describe("Normalizer",function () {

    it("should remove spaces and null character",function () {
        var value = "t  hi     s is a \n  te \t  st \f \v .\r"
        value = new Normalizer(value).run();
        expect(value).toEqual("t hi s is a te st . ")
    })

    it("should remove quotes",function () {
        var value = "this'is`a´te‘st’. ``"
        value = new Normalizer(value).run();
        expect(value).toEqual('this"is"a"te"st". "')
    })


})