var Jury = require('../../src/jury');

describe("Jury",function () {
    var jury = new Jury(getRules());
    
    it("._rules should be object",function () {
        expect(typeof(jury)).toBe("object")
        expect(typeof(jury._rules)).toBe("object")
        expect(typeof(jury._rules.db)).toBe("object")
        expect(typeof(jury._rules.request)).toBe("object")
        expect(typeof(jury._rules.file)).toBe("object")
        expect(typeof(jury._rules.memory)).toBe("object")
        expect(Object.keys(jury._rules.db)[0]).toEqual("600")
        expect(Object.keys(jury._rules.request)[0]).toEqual("700")
        expect(Object.keys(jury._rules.file)[0]).toEqual("100")
        expect(Object.keys(jury._rules.file)[1]).toEqual("113")
        expect(Object.keys(jury._rules.file)[2]).toEqual("800")
        expect(Object.keys(jury._rules.file)[3]).toEqual("801")
        expect(Object.keys(jury._rules.memory)[0]).toEqual("566")
    })

    it("content of db rules",function () {
        expect(jury._rules.db['600']._id).toEqual("600")
        expect(jury._rules.db['600']._type).toEqual("PREG")
        expect(jury._rules.db['600']._score).toEqual(60)
        // need to fix
        // expect(jury._rules.db['600']._target).toEqual('')
        // expect(jury._rules.db['600']._source).toEqual('')
        expect(jury._rules.db['600']._normalize).toEqual(true)
        expect(typeof(jury._rules.db['600']._rule)).toBe("string")
    })

    it("content of request rules",function () {
        expect(jury._rules.request['700']._id).toEqual("700")
        expect(jury._rules.request['700']._type).toEqual("PREG")
        expect(jury._rules.request['700']._score).toEqual(100)
        // need to fix
        // expect(jury._rules.request['700']._source).toEqual('')
        expect(jury._rules.request['700']._target).toEqual('REQUEST')
        expect(jury._rules.request['700']._normalize).toEqual(true)
        expect(typeof(jury._rules.request['700']._rule)).toBe("string")
    })

    it("content of file rules which target= FILENAME",function () {
        expect(jury._rules.file['100']._id).toEqual("100")
        expect(jury._rules.file['100']._type).toEqual("PREG")
        expect(jury._rules.file['100']._score).toEqual(80)
        // need to fix
        // expect(jury._rules.file['100']._source).toEqual('')
        // expect(jury._rules.file['100']._normalize).toEqual(true)
        expect(jury._rules.file['100']._target).toEqual('FILENAME')
        expect(typeof(jury._rules.file['100']._rule)).toBe("string")
    })

    it("content of file rules which target= CONTENT",function () {
        expect(jury._rules.file['113']._id).toEqual("113")
        expect(jury._rules.file['113']._type).toEqual("PREG")
        expect(jury._rules.file['113']._score).toEqual(40)
        // need to fix
        // expect(jury._rules.file['113']._source).toEqual('')
        // expect(jury._rules.file['113']._normalize).toEqual(true)
        expect(jury._rules.file['113']._target).toEqual('CONTENT')
        expect(typeof(jury._rules.file['113']._rule)).toBe("string")
    })

    it("content of file rules which target= URL",function () {
        expect(jury._rules.file['801']._id).toEqual("801")
        expect(jury._rules.file['801']._type).toEqual("PREG")
        expect(jury._rules.file['801']._score).toEqual(25)
        // need to fix
        // expect(jury._rules.file['801']._source).toEqual('')
        // expect(jury._rules.file['801']._normalize).toEqual(true)
        expect(jury._rules.file['801']._target).toEqual('URL')
        expect(typeof(jury._rules.file['801']._rule)).toBe("string")
    })

    it("content of file rules which target= PARAMETERS",function () {
        expect(jury._rules.file['800']._id).toEqual("800")
        expect(jury._rules.file['800']._type).toEqual("PREG")
        expect(jury._rules.file['800']._score).toEqual(25)
        // need to fix
        // expect(jury._rules.file['800']._source).toEqual('')
        // expect(jury._rules.file['800']._normalize).toEqual(true)
        expect(jury._rules.file['800']._target).toEqual('PARAMETERS')
        expect(typeof(jury._rules.file['800']._rule)).toBe("string")
    })

    it("content of memory rules",function () {
        expect(jury._rules.memory['566']._id).toEqual("566")
        expect(jury._rules.memory['566']._type).toEqual("PREG")
        expect(jury._rules.memory['566']._score).toEqual(80)
        // need to fix
        // expect(jury._rules.memory['566']._source).toEqual('')
        // expect(jury._rules.memory['566']._normalize).toEqual(true)
        expect(jury._rules.memory['566']._target).toEqual('CONTENT')
        expect(typeof(jury._rules.memory['566']._rule)).toBe("string")
    })

    it(".use() should filter rules",function () {
        expect(jury.use('file','FILENAME')._rules['100']._target).toEqual('FILENAME')
        expect(jury.use('file','CONTENT')._rules['113']._target).toEqual('CONTENT')
        expect(jury.use('file','PARAMETERS')._rules['800']._target).toEqual('PARAMETERS')
        expect(jury.use('file','URL')._rules['801']._target).toEqual('URL')
    })
    
})

function getRules()
{
    return {
        "db":{
            "600":{
                "target":"",
                "type":"PREG",
                "rule":"(.*)",
                "normalize":true,
                "score":60,
                "description":"Detects Attack",
                "tag":"sqli"
            }
        },
        "request":{
            "700":{
                "target":"REQUEST",
                "type":"PREG",
                "normalize":true,
                "tag":"ci",
                "rule":"(.*)",
                "description":"Detects Attack",
                "score":100
            }
        
        },
        "file":{
            "100":{
                "target":"FILENAME",
                "exclude":"",
                "type":"PREG",
                "rule":"(.*)",
                "score":80,
                "tag":"backdoor",
                "description":"Detects Attack",
            },
            "113":{
                "target":"CONTENT",
                "exclude":"",
                "type":"PREG",
                "rule":"(.*)",
                "score":40,
                "tag":"RCE",
                "description":"Detects Attack",
            },
            "801":{
                "target":"URL",
                "type":"PREG",
                "normalize":true,
                "tag":"lfi",
                "rule":"(.*)",
                "description":"Detects Attack",
                "score":25
            },
            "800":{
                "target":"PARAMETERS",
                "type":"PREG",
                "normalize":true,
                "tag":"lfi",
                "rule":"(.*)",
                "description":"Detects Attack",
                "score":25
            }
        },
        "memory": {
            "566":{

                "target":"CONTENT",
                "exclude":"",
                "type":"PREG",
                "rule":"(.*)",
                "score":80,
                "tag":"Memory",
                "description":"Detects Attack",

            }
        }
    }
}