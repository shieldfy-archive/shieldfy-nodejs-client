const shieldfy = require('../index').start({
    appKey:'7nh1p9t',
    appSecret:'e1cc34ae072216e829b114ff1a6c88831ca8dd2807b692a29e3fbbd3830b48ab',
    endPoint:'http://e735900c.ngrok.io/v2/'
});

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost',
});

// Add the route
server.route({
    method:'GET',
    path:'/hapi',
    handler:function(request,h) {
        console.log('====================================');
        console.log(Hapi.server);
        console.log('====================================');

        return'hello world';
    }
});

// Start the server
const start =  async function() {

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();