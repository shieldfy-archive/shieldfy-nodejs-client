'use strict';

const hostile = require('hostile');

function SSRFJudgeFudge(host)
{
    // var WIN32 = 'win32', LINUX = 'linux';
    var hostFiles = {
        'win32' : 'C:\\Windows\\System32\\Drivers\\etc\\hosts.',
        'linux' : '/etc/hosts'
    }

    //Case #2: Block access to domains defined in 'hosts' file
    var hosts = hostile.getFile(hostFiles[process.platform]);
    var hostnames = [];

    hosts.forEach(hostEntry => {
        hostnames.push(hostEntry[1]);
    })

    if(hostnames.indexOf(host) > -1) {
        return {
            score: 100,
            rulesIds: ["444"]
        };
    }

    return false;
}

module.exports = SSRFJudgeFudge;