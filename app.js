var createError = require('http-errors');
var express = require('express');

//引入插件body-parser
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//token解密
const expressJWT = require('express-jwt');
var { PRIVITE_KEY } = require("./util/jwt");
//定义路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var administratorsRouter = require('./routes/administrators');

var app = express();
//改写
var http = require('http');
const { urlencoded } = require('body-parser');
var server = http.createServer(app);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//静态资源
app.use(express.static(path.join(__dirname, 'public')));

//使用此方法拦截所有请求看token是否正确（此方法写在静态资源加载之后，不然静态资源不能访问）
app.use(expressJWT({
  secret: PRIVITE_KEY,
  algorithms: ['HS256'],
}).unless({
  path: ['/admins/login', '/admins/regAdmin', '/users/login', '/users/regUser'] //⽩白名单,除了了这⾥里里写的地址，其他的URL都需要验证
}));
//如果解析失败
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('没有token不给过哦')

  }
})

//post 请求
app.use(bodyParser.json());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admins', administratorsRouter);
//cors
var cors = require('cors');
app.use(cors({
  origin: ['http://localhost:8080'],  //指定接收的地址
  methods: ['GET', 'POST'],  //指定接收的请求类型
  alloweHeaders: ['Content-Type', 'Authorization']  //指定header
}));


// 不暴露
// module.exports = app;
// 监听
server.listen('3000');
