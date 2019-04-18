const Hook = require('require-in-the-middle');
const Shimmer = require('shimmer');

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
                            
                            if(paramValue === value){
                                
                                let Judge = Client._jury.use('memory');
                                if(Judge.execute(paramValue)){
                                    Judge.sendToJail();
                                    return value;
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