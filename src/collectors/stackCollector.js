const fs = require('fs');
const stackman = require('stackman')();

function StackCollector()
{
    
}

StackCollector.prototype.parse = function(err, callback)
{
    getParsedStack((parsedStack) => {
        var vulnerableLine =getVulnerableLine(parsedStack);
        var lineNumber= vulnerableLine[0];
        var path= vulnerableLine[1];
        lineCollector(path, lineNumber, function(codeContent) {
            callback({
                code: codeContent,
                lineNumber: lineNumber,
                path: path
            });
        });
    });
}


/**
 * @param {Function} cb
 */
function getParsedStack(cb) {
    stackman.callsites(new Error(), function (err, callsites) {
        // if (err) throw err
        var stack = [];
        for (let index = 0; index < callsites.length; index++) {
            stack[index] = [];
            stack[index].push(callsites[index].getLineNumber());
            stack[index].push(callsites[index].getFileName());
        }
        cb(stack);
        return
    })
}

 
/**
 * @param {string} filename
 * @param {number} line_no
 */
function lineCollector(filename, line_no, cb)
{

    if (typeof line_no !== 'number') {
        cb([]);
        return 'line number type must be a number';
    } else if (Number(line_no) === line_no && line_no % 1 !== 0) {
        cb([]);
        return 'line number must be integer';
    } else if (line_no <= 0) {
        cb([]);
        return 'line number must be greater than 0';
    }
    
    var start;
    var end;
    var codeContent = [];

    fs.readFile(filename, (err, data) => {
        if (err) {
            cb([]);
            return err;
        }
        var fileData = data.toString();
        var lines = fileData.split("\n");
        var fileLines = lines.length;
        
        if (fileLines < line_no) {
            cb([]);
            return `line number: ${line_no} not found in the file`;
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
        for (var i=start-1; i<= end-1; i++) {
            lineNumber = i+1;
            var obj = {};
            obj[lineNumber] = lines[i];
            codeContent.push(lines[i]);
        }
        cb(codeContent);
        return;
    });
}


/**
 * @param {Array} stackArray
 */
function getVulnerableLine(stackArray)
{
    var vulnerableLines = stackArray.filter(element => {
        if (element[1] && element[1].indexOf('node_modules') === -1 && element[1].indexOf('shieldfy-nodejs-client') === -1) {
            return element;
        }
    });
    return vulnerableLines[0];
}

module.exports = new StackCollector();