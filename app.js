const express = require('express');
const mysql = require('./mysql');
let app = express();
app.listen(8080);
const bodyparser = require('body-parser');
const { sendFile } = require('express/lib/response');
const multer = require("multer"); //文件上传处理模块
const upload = multer({ dest: 'upload/' });  //指定图片存储位置
const fs = require("fs");  //读写文件的模块
const path = require("path");  //处理路径的模块
const { log } = require('console');
const { func } = require('assert-plus');
// const { values } = require('core-js/core/array');
app.use(express.static('public'));	//托管静态资源到public目录
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/login.html')
})
app.use(express.static('public'))
app.use(bodyparser.urlencoded({
    extended: false  
}))

 

//2.

//单图片上传upload.single   多图片上传 upload.array
app.post('/picture', upload.single('images'), (req, res) => {
    var images = req.file;
    console.log(images);
    //读取文件
    fs.readFile(images.path, (err, data) => {
        if (err) {
            console.log("图片上传失败");
            return;
            
        }
        var imgesori = images.originalname;  //图片名称
        //Date.now()  返回当前日期和时间的Date对象与'1970/01/01 00:00:00'之间的毫秒值
        var radname = Date.now() + parseInt(Math.random() * 999);   //图片时间戳和随机数
        var oriname = imgesori.lastIndexOf('.'); //找到图片名称中最后一个.的位置（下标）
        var hzm = imgesori.substring(oriname);  //图片后缀名
        var pic = radname + hzm; //完整的图片名称 
        //写入文件
        fs.writeFile(path.join(__dirname, './public/image/' + pic), data, (err) => {
            if (err) {
                console.log("图片写入失败！");
                res.send({
                    code: -1,
                    msg: "图片上传失败！"
                })
                return
            }
            var picPath = "http://127.0.0.1:8080/image/" + pic; //完整路径，保存到数据库用
            console.log(picPath);
            res.send({
                code: 200,
                msg: "图片上传成功",
                urls: picPath
            })
            // mysql.query('insert into contract (category_img=?) values(picPath) ', function (err, result) {
            //     if (err) {
            //         console.log("保存到数据库失败！");
            //     }
            //     res.send({
            //         code: 200,
            //         msg : "图片上传成功",
            //         urls: picPath
            //     })
            // })
            // 把picPath存到数据里
            app.post('/release', function (req, res) {
                let obj = req.body;
                console.log(obj);
                mysql.query('insert into tp(img,name) values(?,?) ', [picPath,obj.film], function (err, result) {
                    if (err) throw err;
                    console.log(result);
                    if (result.affectedRows > 0) {
                        res.send('1')
                    } else {
                        res.send('0')
                    }
                })
            })
     
        })
    })
})

