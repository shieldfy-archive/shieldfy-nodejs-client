var fs = require('fs');
/**
 * Example Input
 *
 * Error
 *  at module.exports (/home/eslam/Code/nodejs/shieldfy/lib/collectors/stackCollector.js:27:25)
    at Function.from (/home/eslam/Code/nodejs/shieldfy/lib/monitors/memoryMonitor.js:27:25)
    at Server.requestHandler (/home/eslam/Code/nodejs/simple.js:29:20)
    at emitTwo (events.js:126:13)
    at Server.emit (events.js:214:7)
    at Server.<anonymous> (/home/eslam/Code/nodejs/shieldfy/lib/session.js:61:35)
    at parserOnIncoming (_http_server.js:619:12)
    at HTTPParser.parserOnHeadersComplete (_http_common.js:112:17)
 *
 *
 * Example Output
 *
 * {
    ['Function.from','/home/eslam/Code/nodejs/shieldfy/lib/monitors/memoryMonitor.js','27'],
    ['Server.requestHandler','/home/eslam/Code/nodejs/simple.js','29'],
    ....
 * }
 *
 */

 // var stack=" Error\n    at module.exports (/home/eslam/Code/nodejs/shieldfy/lib/collectors/stackCollector.js:27:25)\n    at Function.from (/home/eslam/Code/nodejs/shieldfy/lib/monitors/memoryMonitor.js:27:25)\n    at Server.requestHandler (/home/eslam/Code/nodejs/simple.js:29:20)\n    at emitTwo (events.js:126:13)\n    at Server.emit (events.js:214:7)\n    at Server.<anonymous> (/home/eslam/Code/nodejs/shieldfy/lib/session.js:61:35)\n    at parserOnIncoming (_http_server.js:619:12)\n    at HTTPParser.parserOnHeadersComplete (_http_common.js:112:17)"

module.exports.stackCollector = function (stack)
{
    
    stack=stack.split(" at ");//this is an array
    stack.shift();//remove first line
    stack.shift();//remove second line
    // stack.pop();//remove last line

    //split the errorLog from the path
    stack=stack.map(function (pharse) {
        return pharse.trim().split(" (");
    });
 
    for (var i = 0; i < stack.length; i++) {
        
        if(stack[i].length === 1){
            stack[i][1] = stack[i][0]
            stack[i][0] = ''
        }
        var str=stack[i][1];

        // stack[i][1]=str.match(/(.*)\)/)[1]; //remove right parenthes by regex
        stack[i][1]=str.substring(0,str.length-1);//remove parentheses
        
        stack[i].push(str.match(/:([0-9]*):/)[1]); //get line no.
        
        // stack[i][1]=str.substring(0,str.indexOf(':')); //remove path
        stack[i][1]=str.match(/(.*\.js)/)[1]; //remove path by regex
    }

    return stack;
}

 
/**
 * @param {string} filename
 * @param {number} line_no
 */
module.exports.lineCollector= function (filename, line_no)
{

    if (typeof line_no !== 'number') {
        return 'line number type must be a number'
    }else if(Number(line_no) === line_no && line_no % 1 !== 0){
        return 'line number must be integer'
    }else if(line_no <= 0){
        return 'line number must be greater than 0'
    }
    
    var start;
    var end;
    var codeContent=[];
    
    try{
        var fileData= fs.readFileSync(filename).toString();
    }catch(e){
        return e;
    }
    
    var lines = fileData.split("\n");
    var fileLines= lines.length;
    
    if (fileLines < line_no) {
        return `line number: ${line_no} not found in the file`
    }
    
    switch (line_no) {
        case 1:
        start= 1;
        end= 4;
        break;
        
        case 2:
        start= 1;
        end= 5;
        break;
        
        case 3:
        start= 1;
        end= 6;
        break;
        
        case fileLines:
        start= fileLines-3;
        end= fileLines;
        break;
        
        case fileLines-1:
        start= fileLines-4;
        end= fileLines;
        break;
        
        case fileLines-2:
        start= fileLines-5;
        end= fileLines;
        break;
        
        default:
        start= line_no-3;
        end= line_no+3;
        break;
    }

    var lineNumber
    for(var i=start-1; i<= end-1; i++){
        lineNumber= i+1
        var obj = {};
        obj[lineNumber] = lines[i];
        codeContent.push(lines[i]);
    }
    
    return codeContent;
}


/**
 * @param {Array} stackArray
 */
module.exports.getTheVulnerableLine= function (stackArray)
{
    var vulnerableLines= stackArray.filter(element => {
        if (element[1].indexOf('node_modules') === -1) {
            return element
        }
    });
    return vulnerableLines[0];
}