const MonitorsList = [
    'db',
    'memory',
    'file',
    // 'execution',
    // 'view',
    'ssrf',
    // 'express',
    'viewX'
];
const monitors = function(Client)
{
    MonitorsList.forEach(monitor => {
       require('./'+monitor+'Monitor').run(Client);
    });
}


module.exports = monitors;
