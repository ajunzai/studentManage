// 导入模块
let express = require("express");
let path = require("path");
// 模块验证码
let svgCaptcha = require("svg-captcha");
// session模块
let session = require("express-session");
// 导入body-parser 格式化表单数据
let bodyParser = require('body-parser')
// 引入mongodb
let MongoClient = require('mongodb').MongoClient;
// 库的路径
let url = 'mongodb://localhost:27017';
// 库的名字
let dbName = 'test';
// 创建app
let app = express();
// 设置托管静态资源
app.use(express.static("static"));
// 使用session 中间件
// 每个理由的 req对象中 都增加session 这个属性
// 每个路由中多了一个可以访问到的session属性  可以在他身上保存 需要共享的属性
app.use(session({
    secret: 'keyboard cat'
}))
// 使用bodyparser中间件
app.use(bodyParser.urlencoded({
    extended: false
}))
// 路由1
// 使用get方法  访问登入页面 直接读取登入页面 并返回
app.get("/login", (req, res) => {
    // 直接读取文件并返回
    res.sendFile(path.join(__dirname, "/static/views/login.html"));
})
// 路由2 
// 使用post 提交数据过来 验证用户登陆
app.post('/login', (req, res) => {
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    // 验证码
    let code = req.body.code;
    // 跟session中的验证码进行比较
    if (code == req.session.captcha) {
        MongoClient.connect(url, (err, client) => {
            const db = client.db(dbName);
            // 获取文档集合
            let collection = db.collection('userList');
            collection.find({
                userName
            }).toArray((err, docs) => {
                console.log(docs);
                if (docs[0].userName == userName && docs[0].userPass == userPass) {

                    // 设置session
                    req.session.userInfo = {
                        userName,
                        userPass
                    }
                    // 去首页
                    res.redirect('/index');
                }
            })
            // client.close();
        });
    } else {
        // 打回去
        res.setHeader("content-type", "text/html");
        res.send('<script>alert("验证码失败");window.location.href = "/login"</script>')
    }
})
// 路由3
// 生成图片的功能
// 把这个地址 设置 登入页的 图片的 src属性
app.get("/login/captchaImg.png", (req, res) => {
    var captcha = svgCaptcha.create();
    // req.session.captcha = captcha.text;
    // console.log(captcha.text);
    // 保存验证码的值 到session后续使用  直接转换为小写
    req.session.captcha = captcha.text.toLocaleLowerCase();
    res.type('svg');
    res.status(200).send(captcha.data);
})
// 路由4
// 访问首页
app.get("/index", (req, res) => {
    if (req.session.userInfo) {
        res.sendFile(path.join(__dirname, "static/views/index.html"));
    } else {
        // 打回去
        res.setHeader("content-type", "text/html");
        res.send('<script>alert("请登入");window.location.href = "/login"</script>')
    }
})
// 路由5
// 登出操作
// 删除session的值即可
app.get('/logout', (req, res) => {
    delete req.session.userInfo;
    // 去登入页
    res.redirect('/login');
})
// 路由6
// 展示注册页面
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, "static/views/register.html"));
})
// 路由7
// 注册页
app.post("/register", (req, res) => {
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    // console.log(userName);
    // console.log(userPass);
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, client) {
        let db = client.db(dbName);
        // 获取文档集合
        let collection = db.collection('userList');
        // 增加姓名和密码至数据库(判断是否有重复的)
        collection.find({
            userName
        }).toArray((err, docs) => {
            console.log(docs);
            if (docs.length == 0) {
                // 没有
                collection.insertOne({
                    userName,
                    userPass
                }, (err, result) => {
                    res.setHeader('content-type', 'text/html');
                    res.send("<script>alert('欢迎入坑');window.location.href='/login'</script>")
                    client.close();
                })
            } else {
                res.redirect(path.join(__dirname, "static/views/register.html"));
            }
        })
    });
})
// 开始监听
app.listen(8848, "127.0.0.1", () => {
    console.log("success");
})