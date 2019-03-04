# test static file apm express module `test failed`
1. open terminal and type `node express`.
2. enter url `http://localhost:3000/index.html`
3. ***it expect*** to load page content `hello Shieldfy`
> the reason of test failed because the rules in fileMonitor block the static files

# test express.Router.use (middleware) apm express module `passed`
1. open terminal and type `node express`.
2. enter url `http://localhost:3000/use`
3. ***it expect*** to load page content `Birds home page` and print in console `Time: 4895646488` for example

# test res.writeHead apm http module `passed`
1. open terminal and type `node express`.
2. enter url `http://localhost:3000/writeHead`
3. ***it expect*** to load page content `hello world`

# test mongodb-core apm mongodb-core module *`test passed`*
1. open terminal and type `node express`.
2. enter url `http://localhost:3000/mongodb-core`
3. ***it expect*** to load page content `hello world`

# test mysql.createConnection & connection.connect & connection.query apm mysql module *`test passed`*
1. open terminal and type `node express`.
2. enter url `http://localhost:3000/mysql`
3. ***it expect*** to load page content `hello world!`

# test redis apm redis module *`test passed`*
1. open terminal and type `node express`.
2. enter url `http://localhost:3000/redis`
3. ***it expect*** to load page content `hello world!`

# test hapi apm hapi module *`test passed`*
1. open terminal and type `node hapi`.
2. enter url `http://localhost:3000/hapi`
3. ***it expect*** to load page content `hello world!`

# test restify apm restify module *`test passed`*
1. open terminal and type `node restify`.
2. enter url `http://localhost:3000/restify`
3. ***it expect*** to load page content `hello world!`

# test koa & koa-router apm koa & koa-router module *`test passed`*
1. open terminal and type `node koa`.
2. enter url `http://localhost:3000/koa`
3. ***it expect*** to load page content `hello world!`

# test handlebars.compile apm handlebars module *`test passed`*
1. open terminal and type `node express`.
2. enter url `http://localhost:3000/handlebars`
3. ***it expect*** to load page content `hello shieldfy!`

# test cassandra.execute & cassandra.eachRow & cassandra.batch  apm cassandra-driver module *`test passed`*
1. open terminal and type `node express`.
2. enter url `http://localhost:3000/cassandra`
3. ***it expect*** to load page content `hello world!` cassendra must be installed and running

# bluebird & apollo-server-core & tedious & ws & express-queue *`pending`*
> the documentation of these module not clear to use it

# graphQL & express-graghQL *`pending`*
> no specifice listener to any function in apm module to test these modules

# `Run Testing`
### 1. clone the reporository
### 2. `cd nodejs-sdk-rebuild`
### 3. run `npm install`
### 4. `cd test/spec`
### 4. run `jasmine <fileName>Spec.js`