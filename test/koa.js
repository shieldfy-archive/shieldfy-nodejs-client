const shieldfy = require('../index').start({
    appKey:'7nh1p9t',
    appSecret:'e1cc34ae072216e829b114ff1a6c88831ca8dd2807b692a29e3fbbd3830b48ab',
    endPoint:'http://e735900c.ngrok.io/v2/'
});
const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();

app.use(router.routes());

router.get("/koa", async (ctx) => {
    console.log('====================================');
    console.log(require('koa-router').prototype.match);
    console.log('====================================');
    ctx.message = 'Hello World';
});

app.listen(3000,()=>{
  console.log("server running on port 3000...");
});