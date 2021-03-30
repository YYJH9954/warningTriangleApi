const { LoopDetected } = require('http-errors');
//引入bcrypt密码加密
const bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
// jwt生成token
var { PRIVITE_KEY, EXPIRESD } = require("../util/jwt.js")
const jwt = require("jsonwebtoken");
var dbCongif = require('../util/dbconfig.js');




//修改用户'信息详情'
let setUserInfo = async (user_id, user_birth, user_sex, user_job, user_path) => {
  let sql = "update usersInfo set user_birth=?,user_sex=?,user_job=?,user_path=? where user_id=?";
  let sqlArr = [user_birth, user_sex, user_job, user_path, user_id];
  let res = await dbCongif.SysqlConnect(sql, sqlArr);
  // console.log(res)
  if (res.affectedRows == 1) {
    console.log("修改用户信息详情成功");
    return true
  }
  else {
    console.log("修改用户信息详情失败");
    return false
  }

}

//修改用户名称_方法
let setUserInfoElse = async (user_id, user_name, user_tel, user_email) => {
  let sql = 'update users set \
  user_name=?,\
  user_tel=?,\
  user_email=?\
  where user_id=?';
  let sqlArr = [user_name, user_tel, user_email, user_id];
  let res = await dbCongif.SysqlConnect(sql, sqlArr);
  if (res.affectedRows == 1) {
    console.log("修改用户名称_方法成功");
    return true
  }
  else {
    console.log("修改用户名称_方法失败");
    return false
  }
}

//修改管理员名称_方法
let setAdminInfo = async (administrator_name, administrator_tel, administrator_email, administrator_right) => {
  let sql = 'update administrators set \
  administrator_name=?,\
  administrator_email=?,\
  administrator_right=?\
  where administrator_tel=?';
  let sqlArr = [administrator_name, administrator_email, administrator_right, administrator_tel];
  let res = await dbCongif.SysqlConnect(sql, sqlArr);
  if (res.affectedRows == 1) {
    console.log("修改管理员_方法成功");
    return true
  }
  else {
    console.log("修改管理员_方法失败");
    return false
  }
}



//管理员登陆
login = (req, res) => {
  console.log("执行管理员登陆");
  var administrator_tel = req.query.administrator_tel,
    administrator_psd = req.query.administrator_psd;
  let sql = "select administrator_psd from administrators where administrator_tel= ?";
  let sqlArr = [administrator_tel];
  let callBack = async (err, data) => {
    if (err) {
      console.log(err);
      res.send({
        'code': 404,
        'msg': "出错啦"
      })
    }
    else {
      const match = bcrypt.compare(administrator_psd, data[0].administrator_psd)
      // 查看输入密码和数据库密码
      console.log(administrator_psd, data[0].administrator_psd)
      match.then(res1 => {
        //.then是接收正确返回的信息
        if (res1 == true) {
          const token = jwt.sign({ administrator_tel }, PRIVITE_KEY, { expiresIn: EXPIRESD });
          res.send({
            'code': 200,
            'msg': '登陆成功',
            'token': token
          })
        }
        else {
          res.send({
            'code': 404,
            'msg': "管理员或者密码出错了",
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
//管理员注册
regAdmin = async (req, res) => {
  //检测手机号是否存在
  let { administrator_name, administrator_psd, administrator_tel, administrator_email, administrator_right } = req.query;
  var hash = bcrypt.hashSync(administrator_psd, salt);
  let sql = "select * from administrators where administrator_tel = ?";
  let sqlArr = [administrator_tel];
  let result1 = await dbCongif.SysqlConnect(sql, sqlArr);
  console.log(result1.length);
  if (result1.length) {
    res.send({
      'code': 400,
      'msg': '已经存在此管理员'
    })
  } else {
    //检测到管理员第一次注册
    let sql = 'insert into administrators (administrator_name,administrator_psd,administrator_tel, administrator_email, administrator_right) value(?,?,?,?,?)';
    let sqlArr = [administrator_name, hash, administrator_tel, administrator_email, administrator_right];
    let result = await dbCongif.SysqlConnect(sql, sqlArr);
    if (result.affectedRows == 1) {
      res.send({
        'code': 200,
        'msg': '管理员注册成功'
      })
    }
    else {
      res.send({
        'code': 404,
        'msg': '管理员注册失败'
      })
    }

    return true
  }
}
//修改管理员详情接口 （名字+手机+邮箱+权限）
editAdmin = async (req, res) => {
  let { administrator_name, administrator_tel, administrator_email, administrator_right } = req.query;
  let result = await setAdminInfo(administrator_name, administrator_tel, administrator_email, administrator_right);
  if (result) {
    res.send({
      'code': 200,
      'msg': '修改成功'
    })
  }
  else {
    res.send({
      'code': 400,
      'msg': '修改失败'
    })
  }
}

//修改用户详情接口 （名字+手机+邮箱+详情）
editUserInfo = async (req, res) => {
  var { user_id, user_birth, user_sex, user_job, user_path, user_name, user_tel, user_email } = req.query;
  let result = await setUserInfo(user_id, user_birth, user_sex, user_job, user_path);
  if (result) {
    let res1 = await setUserInfoElse(user_id, user_name, user_tel, user_email);
    if (res1 == true) {
      res.send({
        'code': 200,
        'msg': '修改成功'
      })
    } else {
      res.send({
        'code': 400,
        'msg': '修改失败'
      })
    }

  }
  else {
    res.send({
      'code': 400,
      'msg': '修改失败'
    })
  }
}

//删除用户名称_方法
deleteAdmin = async (req, res) => {
  let { administrator_tel } = req.query;
  let sql = 'delete from administrators where administrator_tel=?';
  let sqlArr = [administrator_tel];
  let result = await dbCongif.SysqlConnect(sql, sqlArr);
  if (result.affectedRows == 1) {
    res.send({
      'code': 200,
      'msg': "删除管理员成功"
    })
  }
  else {
    res.send({
      'code': 400,
      'msg': "删除管理员失败"
    })
  }
}

//删除用户名称_方法
deleteUserAll = async (req, res) => {
  let { user_id } = req.query;
  let sql = 'delete from users where user_id=?';
  let sqlArr = [user_id];
  let result = await dbCongif.SysqlConnect(sql, sqlArr);
  if (result.affectedRows == 1) {
    res.send({
      'code': 200,
      'msg': "删除用户成功"
    })
  }
  else {
    res.send({
      'code': 400,
      'msg': "删除用户失败"
    })
  }
}



module.exports = {
  login,
  editUserInfo,
  deleteUserAll,
  regAdmin,
  editAdmin,
  deleteAdmin


}
