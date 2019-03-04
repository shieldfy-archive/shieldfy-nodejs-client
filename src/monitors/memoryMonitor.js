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

            // add try beacuse this function is used before the rules get downloaded
            try{
                let Judge = Client._jury.use('memory');
                let result = Judge.execute(buff);
                if(result){
                    var stack = new Error().stack;
                    var codeInfo= StackCollector.stackCollector(stack);
                    var vulnerableLine= StackCollector.getTheVulnerableLine(codeInfo);
                    var path= vulnerableLine[1];
                    var lineNumber= parseInt(vulnerableLine[2]);
                    var codeContent= StackCollector.lineCollector(path, lineNumber);
                    Client._currentRequest._score += result.score;
                    Client.sendToJail('memory', result, codeContent, lineNumber, path, codeInfo);
                }
            }catch(e){}
            var returned = original.apply(this, arguments)
            return returned;
        };
    });
}

module.exports = new memoryMonitor;