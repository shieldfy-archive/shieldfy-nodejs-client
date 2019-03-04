const shieldfy = require('../index').start({
    appKey:'7nh1p9t',
    // appKey:'uyk412jmu',
    appSecret:'e1cc34ae072216e829b114ff1a6c88831ca8dd2807b692a29e3fbbd3830b48ab',
    // appSecret:'a8888014bfa05e04e2dd141343a6351ac3d004f5031bc6aebafcd8b3485c28e4',
    endPoint:'http://e735900c.ngrok.io/v2/'
    // endPoint:'https://api-dev.shieldfy.co/v1/'
});

const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
var path = require("path");
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// test static function from apm express module
app.get('/static',(req,res) => {
    res.send('Hello World');
});

// test express.Router.use (middleware) from apm express module
var router = express.Router()
app.use('/use', router)
// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {
  res.send('Birds home page')
})

// test http.ServerResponse.prototype.writeHead from apm http module
app.get('/writeHead', function (req, res) {
    const body = 'hello world';
    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/plain' ,
    });
    res.end(body)
});

// test mongodb-core from apm mongodb-core module
app.get('/mongodb-core', function (req, res) {
    
    var Server = require('mongodb-core').Server
      , assert = require('assert');
     
    // Set up server connection
    var server = new Server({
        host: 'localhost'
      , port: 27017
      , reconnect: true
      , reconnectInterval: 50
    });
     
    // Add event listeners
    server.on('connect', function(_server) {
        console.log('connected');
        _server.command('system.$cmd', {ismaster: true}, function(err, result) {
 
            // Perform a document insert
            _server.insert('myproject.inserts1', [{a:1}, {a:2}], {
                writeConcern: {w:1}, ordered:true
            }, function(err, results) {
                assert.equal(null, err);
                assert.equal(2, results.result.n);  
            })
            
            _server.update('myproject.inserts1', [{q: {a: 1}, u: {'$set': {b:1}}}], {
                writeConcern: {w:1}, ordered:true
            }, function(err, results) {
                assert.equal(null, err);
                assert.equal(1, results.result.n);
            });

            _server.remove('myproject.inserts1', [{
                q: {a: 1}, limit: 1
            }], {
                writeConcern: {w:1}, ordered:true
            }, function(err, results) {
                assert.equal(null, err);
                assert.equal(1, results.result.n);
            });

            var cursor = _server.cursor('integration_tests.inserts_example4', {
                find: 'integration_tests.example4'
              , query: {a:1}
            });
            cursor.next(function(err, doc) {
                // assert.equal(null, err);
                // assert.equal(2, doc.a);
            })

            _server.command("system.$cmd", {ismaster: true}, function(err, result) {
                assert.equal(null, err)
                _server.destroy();              
            });
        });
    });
     
    server.on('close', function() {
      console.log('closed');
    });
     
    server.on('reconnect', function() {
      console.log('reconnect');
    });
     
    // Start connection
    server.connect();
    res.end('hello world')
});


// test RCE
app.get('/rce', function (req, res) {
    var ChildProcess = require('child_process')
    
    // console.log('====================================');
    // console.log('path => ',ChildProcess.exec('echo "The \\$HOME variable is $HOME"'));
    // console.log('====================================');
    res.send('Hello ' + eval(req.query.q));
    console.log(req.query.q);
});


app.post('/mongo',(req,res) => {
    const MongoClient = require('mongodb').MongoClient;
    const url = 'mongodb://localhost:27017';

    // Database Name
    const dbName = 'myproject';

    // Create a new MongoClient
    const client = new MongoClient(url);
    // console.log('====================================');
    // console.log(req.body);
    // console.log('====================================');
    // Use connect method to connect to the Server
    client.connect(function(err) {
        const db = client.db(dbName);
        const collection = db.collection('documents');
        // Find some documents
        collection.find( req.body ).toArray(function(err, docs) {
            // setTimeout(function(){
                res.end('Hello World! ');
            // },2000);            
        });
    });
    // res.end('Hello World! ');

});

var multer = require('multer');
var upload = multer(); 
app.use(upload.single('img'));
app.post('/file',(req,res) => {
    // let params = req.body.file
    let file = req.file
    var fs = require('fs');
    // var readStream = fs.createReadStream('readMe.md')
    // var writeStream = fs.createWriteStream(__dirname+'/test.txt')
    // var writeStream = fs.createWriteStream(params)
    // var read = fs.readFile('install.ini')
    // var readSync = fs.readFileSync('readMe.md',"utf8")
    // var write = fs.writeFile('install.txt',readSync)
    var writeSync = fs.writeFileSync(file.originalname,file.buffer)
    // var writeStream = fs.createWriteStream('params.txt')
    // readStream.on('data',(chunk)=>{
    //     console.log('====================================');
    //     console.log(writeStream);
    //     console.log('====================================');
    //     writeStream.write(chunk.toString())
    // })
    // readStream.on('end',()=>{
        // const buf4 = Buffer.from(params);
        res.end('Hello World! ');
    // })
    // fs.readFile('/install.ini', (err, data) => {
    //     // if (err) throw err;
    //     console.log(data);
    //     res.end('Hello World! ');
    // });

});

// test mysql from apm mysql module
app.get('/mysql', (req, res) => {

    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'my_database'
    });
    
    connection.connect();
    
    connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    // connection.query(`SELECT * FROM users WHERE userName = '${req.body.user_name}' AND password = '${req.body.password}'`, function (error, results, fields) {
        if (error) throw error;
        // setTimeout(function(){
            console.log('====================================');
            console.log(results);
            console.log('====================================');
            res.send('Hello World!')
            //console.log('The solution is: ', results[0].solution);
        // },2000);        
    });
    
    connection.end();

})

// test redis from apm redis module
app.get('/redis',(req,res) => {
    var redis = require("redis");
    var sub = redis.createClient(), pub = redis.createClient();
    var msg_count = 0;
    
    sub.on("subscribe", function (channel, count) {
        pub.publish("a nice channel", "I am sending a message.");
        pub.publish("a nice channel", "I am sending a second message.");
        pub.publish("a nice channel", "I am sending my last message.");
    });
    
    sub.on("message", function (channel, message) {
        console.log("sub channel " + channel + ": " + message);
        msg_count += 1;
        if (msg_count === 3) {
            sub.unsubscribe();
            sub.quit();
            pub.quit();
        }
    });
    
    sub.subscribe("a nice channel");
    console.log('====================================');
    console.log(redis.RedisClient.prototype.send_command);
    console.log(redis.RedisClient.prototype.internal_send_command);
    console.log('====================================');
    res.end('hello world!')
});

// test handlebars.compile  from apm handlebars module
app.get('/handlebars',(req,res) => {
    var Handlebars = require('handlebars');
    var source = "<h1>Hello, {{name}}.</h1>";

    var template = Handlebars.compile(source);
    
    var data = { "name": "shieldfy" };
    var result = template(data);
    res.send(result)
});


// test cassandra.execute & cassandra.eachRow & cassandra.batch from apm cassandra-driver module
app.get('/cassandra',(req,res) => {
    const cassandra = require('cassandra-driver');
    const client = new cassandra.Client({ contactPoints: ['h1', 'h2'], localDataCenter: 'datacenter1', keyspace: 'ks1' });
 
    const query = 'SELECT name, email FROM users WHERE key = ?';
    client.execute(query, [ 'someone' ])
    .then(result => console.log(result));
    
    const queries = [
        {
          query: 'UPDATE user_profiles SET email=? WHERE key=?',
          params: [ emailAddress, 'hendrix' ]
        },
        {
          query: 'INSERT INTO user_track (key, text, date) VALUES (?, ?, ?)',
          params: [ 'hendrix', 'Changed email', new Date() ]
        }
    ];

    client.batch(queries, { prepare: true })
    .then(result => console.log('Data updated on cluster'));

    client.eachRow('SELECT time, val FROM temperature WHERE station_id=', ['abc'],
    function(n, row) {
        // The callback will be invoked per each row as soon as they are received
        minTemperature = Math.min(row.val, minTemperature);
    },
    function (err) {
        
    }
);

    res.end('hello world!')
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))