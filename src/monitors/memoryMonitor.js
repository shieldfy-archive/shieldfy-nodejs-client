const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');
const Normalizer = require('../normalizer');
const StackCollector = require('../stackCollector');

const memoryMonitor = function()
{

}

memoryMonitor.prototype.run = function(Client)
{
    Shimmer.wrap(Buffer, 'from', function (original) {
        return function (buff) {
            if (Client._currentRequest) {
                try{
                    let value = buff;
                    let requestParams = Client._currentRequest.getParam();
                   
                    if(!(Object.keys(requestParams).length === 0 && requestParams.constructor === Object)){
                        
                        for(let param in requestParams){
                           
                            let paramValue = requestParams[param];
                            
                            if(value.indexOf(paramValue) !== -1){
                                let Judge = Client._jury.use('memory');
                                let result = Judge.execute(paramValue);
                                if(result){
                                    Client._currentRequest._score += result.score;
                                    Client.sendToJail();
                                    var stack = new Error().stack;
                                    new StackCollector(stack).parse(function(codeInfo){
                                        Client.reportThreat('memory', result, codeInfo);
                                    });
                                }
                            }
                        }
                    }
                }catch(e){}
            }
            var returned = original.apply(this, arguments)
            return returned;
        };
    });
}

module.exports = new memoryMonitor;