// 路由中间件
let express = require('express');
let indexRouter = express.Router();
// 引入path
let path = require("path");
// 导入myt
let myT = require(path.join(__dirname, "../tools/myT.js"))
// id 需要使用 mongoDB.ObjectId 这个方法 进行包装 才可以使用
let objectID = require('mongodb').ObjectId;
// 注册路由
// 访问根目录的路由
indexRouter.get('/', (req, res) => {
    // 有session 欢迎
    if (req.session.userInfo) {
        // 获取用户名
        let userName = req.session.userInfo.userName;
        // res.sendFile(path.join(__dirname, '../static/views/index.html'));
        // 使用模板引擎渲染页面  并且返回
        res.render(path.join(__dirname, "../static/views/index.art"), {
            userName
        });
    } else {
        // 打回去
        res.setHeader('content-type', 'text/html');
        res.send('<script>alert("请登入");window.location.href = "/login"</script>');
    }
});
// 新增的接口
indexRouter.get('/insert', (req, res) => {
    // 接受数据
    // 保存数据
    // 接口json格式
    // 返回成功了
    myT.insert("studentList", req.query, (err, result) => {
        if (!err) res.json({
            mess: "新增成功",
            code: 200
        })
    })
})
// 删除的接口
indexRouter.get('/delete', (req, res) => {
    let deleteId = req.query.id;
    myT.delete("studentList", {
        _id: objectID(deleteId)
    }, (err, result) => {
        if (!err) res.json({
            mess: "删除成功",
            code: 200
        })
    })
})
// 改
indexRouter.get('/update', (req, res) => {
    let address = req.query.address;
    let age = req.query.age;
    let introduction = req.query.introduction;
    let name = req.query.name;
    let phone = req.query.phone;
    let sex = req.query.sex;
    myT.update("studentList", {
        _id: objectID(req.query.id)
    }, {
        address,
        age,
        introduction,
        name,
        phone,
        sex
    }, (err, result) => {
        if (!err) res.json({
            mess: "修改成功",
            code: 200
        })
    })
})
// 获取所有数据
indexRouter.get("/list", (req, res) => {
    myT.find("studentList", {}, (err, docs) => {
        if (!err) res.json({
            mess: "数据",
            code: 200,
            data: docs
        })
    })
})
// 查询 
// 根据名字获取数据
// 目前只能根据用户名进行模糊查询
// 增加能够根据id精确查询的功能
indexRouter.get('/search', (req, res) => {
    let query = {};
    // 如果有名字过来  模糊查询
    if (req.query.userName) {
        query.name = new RegExp(req.query.userName);
    }
    // 如果有id进来
    if (req.query.id) {
        query._id = objectID(req.query.id);
    }
    myT.find("studentList", query, (err, docs) => {
        if (!err) res.json({
            mess: "数据",
            code: 200,
            list: docs
        })
    })
})
module.exports = indexRouter;