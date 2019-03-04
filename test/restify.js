const shieldfy = require('../index').start({
    appKey:'7nh1p9t',
    appSecret:'e1cc34ae072216e829b114ff1a6c88831ca8dd2807b692a29e3fbbd3830b48ab',
    endPoint:'http://e735900c.ngrok.io/v2/'
});

var restify = require('restify');

function respond(req, res, next) {
    console.log('====================================');
    console.log(server);
    console.log('====================================');
  res.send('hello world!');
  next();
}

var server = restify.createServer();

server.get('/restify', respond);

server.listen(3000, function() {
  console.log('%s listening at %s', server.name, server.url);
});