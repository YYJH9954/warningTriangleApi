var dbCongif = require('../util/dbconfig.js');
//获取分类——分装

//方法：将4g模块传上来的数据放到equipment中
// let update  = async () => {

// }
//得到用户列表
getUser = (req, res) => {

  var sql = "SELECT\
  users.user_id,\
  users.user_name,\
  IFNULL(users.equip_id,'无'),\
  IFNULL(4g_lastest.lon,'无'),\
  IFNULL(4g_lastest.lon_h,'无'),\
  IFNULL(4g_lastest.lat,'无'),\
  IFNULL(4g_lastest.lat_h,'无'),\
  IFNULL(4g_lastest.switch,0),\
  IFNULL(4g_lastest.lon_h,'无'),\
  IFNULL(4g_lastest.incident_site,'无'),\
  IFNULL(4g_lastest.address,'无')\
  FROM\
  users\
  LEFT JOIN 4g_lastest ON users.equip_id = 4g_lastest.equip_id\
  ";
  var sqlArr = [];
  var callBack = (err, data) => {
    if (err) {
      console.log("连接出错了")
    }
    else {
      res.send({
        'list': data
      })
    }
  }
  dbCongif.sqlConnect(sql, sqlArr, callBack)
},
  //得到用户详情
  getUserInfo = (req, res) => {
    var sql = "SELECT\
  users.user_id,\
  users.user_name,\
  users.user_psd,\
  users.user_tel,\
  users.user_email,\
  usersInfo.user_birth,\
  usersInfo.user_sex,\
  usersInfo.user_job,\
  usersInfo.user_path,\
  users.user_createdtime\
  FROM\
  users\
  LEFT JOIN usersInfo ON usersInfo.user_id = users.user_id\
  ";
    var sqlArr = [];
    var callBack = (err, data) => {
      if (err) {
        console.log("连接出错了")
      }
      else {
        res.send({
          'list': data
        })
      }
    }
    dbCongif.sqlConnect(sql, sqlArr, callBack)
  },
  //得到管理员列表
  getAdmin = (req, res) => {
    var sql = "select * from administrators";
    var sqlArr = [];
    var callBack = (err, data) => {
      if (err) {
        console.log("连接出错了")
      }
      else {
        res.send({
          'list': data
        })
      }
    }
    dbCongif.sqlConnect(sql, sqlArr, callBack)
  }

module.exports = {
  getUser,
  getAdmin,
  getUserInfo

}
