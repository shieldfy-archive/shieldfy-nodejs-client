const shieldfy = require('../../index').start({
    appKey:'',
    appSecret:'',
});

const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
// var path = require("path");
// app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/db/mongo', function (req, res) {

    const MongoClient = require('mongodb').MongoClient;
    const url = 'mongodb://localhost:27017';

    // Database Name
    const dbName = 'myproject';

    // Create a new MongoClient
    const client = new MongoClient(url);

    // Use connect method to connect to the Server
    client.connect(function(err) {
        const db = client.db(dbName);
        const collection = db.collection('documents');
        // Find some documents
        collection.find( req.body ).toArray(function(err, docs) {

            const body = 'hello world';
            res.end(body)
        });
    });

});

app.post('/db/mysql', function (req, res) {
    var mysql      = require('mysql');
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'my_database'
    });
    
    connection.connect();
    
    connection.query(`SELECT * FROM users WHERE userName = '${req.body.userName}' AND password = '${req.body.password}'`, function (error, results, fields) {
        // if (error) throw error;
    });
    
    connection.end();
    const body = 'hello world';
    res.end(body)
});


app.post('/memory', function (req, res) {
    Buffer.from(req.body.key);
    const body = 'hello world';
    res.end(body)
});


var multer = require('multer');
var upload = multer(); 
app.use(upload.single('my_file'));
var fs = require('fs');

app.post('/file/readFile', function (req, res) {
    fs.readFile(req.body.key, (err, data) => {
        // if (err) throw err;
        const body = 'hello world';
        res.end(body)
    });
});

app.post('/file/writeFile', function (req, res) {
    var write = fs.writeFile(req.file.originalname, req.file.buffer,(err, data) => {
        // if (err) throw err;
        console.log(err);
    });
    const body = 'hello world';
    res.end(body)
});

app.post('/file/readFileSync', function (req, res) {
    try{
        fs.readFileSync(req.body.key);
    }catch(e){

    }
    const body = 'hello world';
    res.end(body)
});

app.post('/file/writeFileSync', function (req, res) {
    var writeSync = fs.writeFileSync(req.file.originalname,req.file.buffer)
    const body = 'hello world';
    res.end(body)
});

app.post('/file/createReadStream', function (req, res) {

    var readStream = fs.createReadStream(req.body.key)
    readStream.on('data',(chunk)=>{
        
    })

    readStream.on('end',()=>{
        const body = 'hello world';
        res.end(body)
    })

    readStream.on('error',()=>{
        const body = 'hello world';
        res.end(body)
    })

});

app.post('/file/createWriteStream', function (req, res) {
    var writeStream = fs.createWriteStream(req.file.originalname)
    writeStream.on('error', () => {
        console.log('error cannot create file.');
    });
    writeStream.write(req.file.buffer)
    const body = 'hello world';
    res.end(body)
});


app.post('/request', function (req, res) {
    const body = 'hello world';
    res.end(body)
});



app.post('/execution', function (req, res) {
    const body = 'hello world';
    res.end(body)
});


app.post('/view', function (req, res) {
    const body = 'hello world';
    res.end(body)
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))