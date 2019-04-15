const MonitorsList = [
    'db',
    'memory',
    'file',
    'execution',
    'view',
    'ssrf',
];

const monitors = function(Client)
{
    MonitorsList.forEach(monitor => {
       require('./'+monitor+'Monitor').run(Client);
    });
}


module.exports = monitors;
