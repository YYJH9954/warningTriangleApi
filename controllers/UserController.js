
//引入bcrypt密码加密
const bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
// jwt生成token
var { PRIVITE_KEY, EXPIRESD } = require("../util/jwt.js")
const jwt = require("jsonwebtoken");
const { LoopDetected } = require('http-errors');
var dbCongif = require('../util/dbconfig.js');
//request 调用外部接口使用
const request = require('request');

//高德地图接口
let getLoLa = async (equip_id) => {
  let sql = " select lon,lat from  4g_lastest where equip_id = ?";
  let sqlArr = [equip_id];
  let res = await dbCongif.SysqlConnect(sql, sqlArr);
  return res;
}
//更新数据库定位数据
let updateGPS = async (address, incident_site, equip_id) => {
  let sql = " update 4g_lastest set address=?,incident_site =? where equip_id= ? ";
  let sqlArr = [address, incident_site, equip_id];
  let res = await dbCongif.SysqlConnect(sql, sqlArr);
  if (res.affectedRows == 1) {
    return true;
  }
  else {
    return false;
  }
}

//用户信息注册
let regUserInfo = async (user_id, user_birth, user_sex, user_job, user_path) => {
  let sql = "update usersInfo set user_birth=?,user_sex=?,user_job=?,user_path=? where user_id=?";
  let sqlArr = [user_birth, user_sex, user_job, user_path, user_id];
  console.log(sql, sqlArr);
  let res = await dbCongif.SysqlConnect(sql, sqlArr);
  console.log(res)
  if (res.affectedRows == 1) {
    console.log("注册用户信息详情成功");
    return true
  }
  else {
    console.log("注册用户信息详情失败");
    return false
  }
}

//创建用户信息副表
let createUserInfo = (user_id) => {
  let sql = 'insert into usersInfo (user_id)values(?)';
  let sqlArr = [user_id];
  return dbCongif.SysqlConnect(sql, sqlArr);
}
//检查用户是否有旧的密码
let checkUserPsd = async (user_tel) => {
  let sql = "select user_psd from users where user_tel=?";
  let sqlArr = [user_tel];
  let res = await dbCongif.SysqlConnect(sql, sqlArr);
  console.log("checkPsd", res) //查看返回的密码
  if (res.length) {
    return res[0].user_psd
  }
  else {
    return false
  }
}
//用户注册
regUser = async (req, res) => {
  //检测是否是第一次登陆
  let { user_name, user_psd, user_tel, user_email, user_birth, user_sex, user_job, user_path } = req.query;
  var hash = bcrypt.hashSync(user_psd, salt);
  let sql = "select * from users where user_tel = ?";
  let sqlArr = [user_tel];
  let result1 = await dbCongif.SysqlConnect(sql, sqlArr);
  console.log(result1.length);
  if (result1.length) {
    res.send({
      'code': 400,
      'msg': '已经存在用户'
    })
  } else {//检测到用户第一次注册
    let sql = 'insert into users (user_name,user_psd,user_tel,user_email) value(?,?,?,?)';
    let sqlArr = [user_name, hash, user_tel, user_email];
    let result = await dbCongif.SysqlConnect(sql, sqlArr);
    if (result.affectedRows == 1) {
      //创建用户副表
      let userinfo = await createUserInfo(result.insertId);
      if (userinfo.affectedRows == 1) {
        let resultInfo = await regUserInfo(result.insertId, user_birth, user_sex, user_job, user_path);
        res.send({
          'code': 200,
          'msg': '用户信息详情注册成功'
        })
        return true
      } else {
        res.send({
          'code': 400,
          'msg': '用户信息详情注册失败'
        })
      }
    } else {
      res.send({
        'code': 400,
        'msg': '用户信息详情注册失败'
      })
    }
  }
}

//用户登陆
login = (req, res) => {
  console.log("执行");
  var user_tel = req.query.user_tel,
    user_psd = req.query.user_psd;
  // var hash = bcrypt.hashSync(password, salt);//将获取到的密码进行加密，得到密文hash
  let sql = "select user_psd from users where user_tel= ? ";
  let sqlArr = [user_tel];
  let callBack = async (err, data) => {

    if (err) {
      console.log(err);
      res.send({
        'code': 404,
        'msg': "出错啦"
      })
    }
    else if (data == "") {
      res.send({
        'code': 400,
        'msg': "用户名或者密码出错了",
        'data': []
      })
    }
    else {
      const match = bcrypt.compare(user_psd, data[0].user_psd)
      console.log(user_psd, data[0].user_psd)
      match.then(res1 => {
        //.then是接收正确返回的信息
        if (res1 == true) {
          const token = jwt.sign({ user_tel }, PRIVITE_KEY, { expiresIn: EXPIRESD });
          res.send({
            'code': 200,
            'msg': '登陆成功',
            'token': token
          })
        }
        else {
          res.send({
            'code': 404,
            'msg': "出错啦"
          })
        }
      })
        .catch(err => {
          // .catch 返回报错信息
          console.log(err)
          res.send({
            'code': 404,
            'msg': "出错啦"
          })

        })
    }
  }
  dbCongif.sqlConnect(sql, sqlArr, callBack)
}
//用户修改密码
setPsd = async (req, res) => {
  let { user_tel, oldpassword, newpassword } = req.query;
  //检查用户密码方法
  let userPsd = await checkUserPsd(user_tel);
  // console.log(userPsd)//checkUserPsd—_return的值
  if (userPsd) {//有密码的话
    if (bcrypt.compare(oldpassword, userPsd)) { //判断之前密码和现在密码是否一致
      let sql = "update users set user_psd =? where user_tel=?";
      let sqlArr = [bcrypt.hashSync(newpassword, salt), user_tel]
      let result = await dbCongif.SysqlConnect(sql, sqlArr);
      if (result.affectedRows == true) {
        res.send({
          'code': 200,
          'msg': "修改密码成功"
        })
      } else {
        res.send({
          'code': 400,
          'msg': "修改密码失败"
        })
      }
    } else {
      res.send({
        'code': 400,
        'msg': "旧密码与数据库不一致"
      })
    }
  }
  else {//没有密码直接插入
    let sql = "update users set user_psd =? where user_id=?";
    let sqlArr = [newpassword, user_id]
    let result = await dbCongif.SysqlConnect(sql, sqlArr);
  }
}
//用户忘记密码
forgetPsd = async (req, res) => {
  let { user_tel, newpassword } = req.query;
  let userPsd = await checkUserPsd(user_tel);
  if (userPsd) {//有密码的话
    let sql = "update users set user_psd =? where user_tel=?";
    let sqlArr = [bcrypt.hashSync(newpassword, salt), user_tel]
    let result = await dbCongif.SysqlConnect(sql, sqlArr);
    console.log(result);
    if (result.affectedRows == 1) {
      res.send({
        'code': 200,
        'msg': "修改密码成功"
      })
    } else {
      res.send({
        'code': 400,
        'msg': "修改密码失败"
      })
    }
  }
  else {
    res.send({
      'code': 404,
      'msg': "该用户尚未注册"
    })
  }
}
//用户得到GPS定位数据
getGPS = async (req, res) => {
  let { equip_id } = req.query;
  let res1 = await getLoLa(equip_id);
  console.log(res1);
  console.log(res1[0].lon, res1[0].lat);
  var url = "https://restapi.amap.com/v3/geocode/regeo?key=bd2cd1732c79dd66ce66da37ebe00ed0&location=" + res1[0].lon + "," + res1[0].lat;
  console.log(url);
  request.get(url, function (err, response, data) {
    if (!err) {
      const GPSdata = JSON.parse(data);
      console.log(GPSdata);
      //拼接事故发生地点
      let address = GPSdata.regeocode.addressComponent.country
        + GPSdata.regeocode.formatted_address;
      //拼接事故发生地址
      let incident_site = GPSdata.regeocode.addressComponent.country
        + GPSdata.regeocode.addressComponent.province
        + GPSdata.regeocode.addressComponent.city
        + GPSdata.regeocode.addressComponent.district
        + GPSdata.regeocode.addressComponent.township
        + GPSdata.regeocode.addressComponent.streetNumber.street
        + GPSdata.regeocode.addressComponent.streetNumber.direction
        + GPSdata.regeocode.addressComponent.streetNumber.number;
      console.log(address, incident_site);
      //       //调用了高德地图api接口地址写入数据库
      let result = updateGPS(address, incident_site, equip_id);
      result.then(r => {
        console.log(result)
        if (r == true) {
          let sql1 = "select * from 4g_lastest where equip_id = ?";
          let sqlArr2 = [equip_id];
          let res2 = dbCongif.SysqlConnect(sql1, sqlArr2);
          res2.then(r2 => {
            console.log(r2);
            res.send({
              'code': 200,
              'list': r2,
              'msg': "获得最新数据成功"
            })
          })
        }
      })
        .catch(err => {
          res.send({
            'code': 404,
            'msg': "高德地图插入数据失败"
          })
        })
    }
    else {
      res.send({
        'code': 404,
        'msg': "高德地图定位获取失败"
      })

    }
  })
}



module.exports = {
  login,
  forgetPsd,
  regUser,
  setPsd,
  getGPS,

}
