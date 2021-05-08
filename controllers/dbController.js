var dbCongif = require('../util/dbconfig.js');
//获取分类——分装
//request 调用外部接口使用
const request = require('request');

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

// 得到所有三角牌的{lon,lat}
let getLonLat = async () => {
  let sql = " select lon,lat,equip_id from  4g_lastest";
  let sqlArr = [];
  let res = await dbCongif.SysqlConnect(sql, sqlArr);
  res = JSON.parse(JSON.stringify(res))
  return res
}

let getGPS = async (res) => {
  for (i = 0; i < res.length; i++) {
    if (i != res.length - 1) {
      let equip_id = res[i].equip_id;
      var url = "https://restapi.amap.com/v3/geocode/regeo?key=bd2cd1732c79dd66ce66da37ebe00ed0&location=" + res[i].lon + "," + res[i].lat;
      //调用了高德地图api接口得到地址
      request.get(url, function (err, response, data) {
        if (!err) {
          const GPSdata = JSON.parse(data);
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

          //  updateGPS插入数据库中
          let result = updateGPS(address, incident_site, equip_id);
        }
      })
    }
    else {
      let equip_id = res[i].equip_id;
      var url = "https://restapi.amap.com/v3/geocode/regeo?key=bd2cd1732c79dd66ce66da37ebe00ed0&location=" + res[i].lon + "," + res[i].lat;
      //调用了高德地图api接口得到地址
      return new Promise((resolve, reject) => {
        request.get(url, function (err, response, data) {
          if (!err) {
            const GPSdata = JSON.parse(data);
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

            //  updateGPS插入数据库中
            let result = updateGPS(address, incident_site, equip_id);
            result.then(res => {
              if (res == true) {
                resolve(result);
              }
              else {
                reject(result)
              }
            }).catch(err => {
              reject(err)
            })

          }
        })

      })
    }
  }
}

// 生成树形结构_方法
function formatDataTree (list) {
  let _list = JSON.parse(JSON.stringify(list));
  return _list.filter(p => {
    const _arr = _list.filter(c => c.right_parent_id === p.right_id);
    _arr.length && (p.children = _arr);
    return p.right_parent_id === 0;
  })
}

//得到用户信息列表
getUser = (req, res) => {
  let { search } = req.query;
  var sql = "SELECT\
  users.user_id,\
  users.user_name,\
	users.equip_id,\
  users.user_tel,\
  4g_lastest.lon,\
  4g_lastest.lon_h,\
  4g_lastest.lat,\
  4g_lastest.lat_h,\
  4g_lastest.ifuse,\
  4g_lastest.onoff,\
  4g_lastest.incident_site,\
  4g_lastest.address,\
  4g_lastest.time\
  FROM\
  users\
  LEFT JOIN 4g_lastest ON users.equip_id = 4g_lastest.equip_id\
	where\
	concat(\
	users.user_id,\
  users.user_name,\
  IFNULL(users.equip_id,'无'),\
  users.user_tel,\
  IFNULL(4g_lastest.lon,'无'),\
  IFNULL(4g_lastest.lon_h,'无'),\
  IFNULL(4g_lastest.lat,'无'),\
  IFNULL(4g_lastest.lat_h,'无'),\
  IFNULL(4g_lastest.ifuse,'无'),\
  IFNULL(4g_lastest.onoff,'无'),\
  IFNULL(4g_lastest.incident_site,'无'),\
  IFNULL(4g_lastest.address,'无'))LIKE ?"
  let sqlArr = "%" + [search] + "%";
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
    let { search } = req.query;
    var sql = "SELECT \
    users.user_id, \
    users.user_name, \
    users.user_psd, \
    users.user_tel, \
    users.user_email, \
    usersInfo.user_birth, \
    usersInfo.user_sex, \
    usersInfo.user_job, \
    usersInfo.user_path, \
    users.user_createdtime\
    FROM\
    users\
    LEFT JOIN usersInfo ON usersInfo.user_id = users.user_id \
    where \
    concat( \
      users.user_id, \
      users.user_name, \
      users.user_tel, \
      IFNULL(users.user_email, ''),\
      IFNULL(usersInfo.user_birth, ''),\
      IFNULL(usersInfo.user_sex, ''), \
      IFNULL(usersInfo.user_job, ''), \
      IFNULL(usersInfo.user_path,''),\
      users.user_createdtime) LIKE ? ";
    let sqlArr = "%" + [search] + "%";
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
    let { search } = req.query;
    let sql = "SELECT * FROM `administrators` WHERE CONCAT \
    (`administrator_id`, `administrator_name`, `administrator_tel`,`administrator_email`,\
    `administrator_right`,`administrator_createdtime`) LIKE  ?";
    let sqlArr = "%" + [search] + "%";
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

//得到权限列表
getRight = (req, res) => {
  if (req.query.form == 'list') {
    var sql = "select * from `right` where right_level != '' ";
    var sqlArr = [];
    var callBack = (err, data) => {
      if (err) {
        res.send({
          'code': 400,
          'msg': "得到List失败"
        })
      }
      else {
        res.send({
          'code': 200,
          'list': data,
          'msg': "得到List成功"
        })
      }
    }
    dbCongif.sqlConnect(sql, sqlArr, callBack)
  }
  else if (req.query.form == 'tree') {
    var sql = "select * from `right`";
    var sqlArr = [];
    var callBack = (err, data) => {
      if (err) {
        res.send({
          'code': 400,
          'msg': "得到Tree失败"
        })
      }
      else {
        res.send({
          'code': 200,
          'list': formatDataTree(data),
          'msg': "得到Tree成功"
        })
      }
    }
    dbCongif.sqlConnect(sql, sqlArr, callBack)
  }
  else {
    res.send({
      'code': 400,
      'msg': "没有输入参数"
    })
  }

}

getWarningTriangle = async (req, res) => {
  let res1 = await getLonLat();
  let result = await getGPS(res1)
  if (res1 && result == true) {
    let { search } = req.query;
    let sql = " SELECT \
    equip_id,\
    ifnull(lon,'') as lon,\
    ifnull(lon_h,'') as lon_h,\
    ifnull(lat,'') as lat,\
    ifnull(lat_h,'') as lat_h,\
    ifuse,\
    onoff,\
    ifnull(incident_site,'') as incident_site,\
    ifnull(address,'') as address,\
    time\
    from 4g_lastest WHERE CONCAT(IFNULL(`equip_id`,''),  IFNULL(`lon`,''),  IFNULL(`lon_h`,''),  IFNULL(`lat`,''), \
    IFNULL(`lat_h`,''),IFNULL(`address`,''),  IFNULL(`incident_site`,''),  IFNULL(`time`,'')) LIKE ?";
    let sqlArr = "%" + [search] + "%";
    let result = await dbCongif.SysqlConnect(sql, sqlArr);
    let data = JSON.parse(JSON.stringify(result));
    if (data == "") {
      res.send({
        'code': 400,
        'msg': "没有得到三角牌信息"
      })
    }
    else {
      res.send({
        'code': 200,
        'list': data,
        'total': data.length,
        'msg': "得到三角牌信息"
      })
    }

  }
}

/* 得到三角牌equip_id和是否在使用 */
getEquip_id = (req, res) => {
  let sql = 'select equip_id as value,equip_id as label,ifuse as disabled from  4g_lastest';
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

// -- 	首页页面整体数据
getCount = (req, res) => {
  let sql = "SELECT * from (\
    (SELECT COUNT(user_id)as user_count FROM users) as a,\
    (SELECT COUNT(user_id)as user_equip_count FROM users where users.equip_id !='') as b,\
    (SELECT COUNT(equip_id)as equip_count FROM 4g_lastest) as c,\
    (SELECT COUNT(equip_id)as ifuse_count FROM 4g_lastest WHERE 4g_lastest.ifuse =1)as d,\
    (SELECT COUNT(equip_id)as onoff_count FROM 4g_lastest WHERE 4g_lastest.ifuse =1 AND 4g_lastest.onoff =1)as e,\
    (SELECT COUNT(administrator_id)as administrator_count FROM administrators) as f)"
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

// -- 首页折线图数据
getLineChart = (req, res) => {
  let sql = "select * from (\
    (select DATE_FORMAT(user_createdtime,'%Y-%m') 'user_months',count(*)  user_months_count from users group by user_months order by user_months   asc ) as a  LEFT JOIN (select DATE_FORMAT(time,'%Y-%m') equip_months,count(*) equip_months_count from 4g_lastest group by equip_months order by equip_months   asc) as b ON a.user_months = b.equip_months )"
  var sqlArr = [];
  const date = [];
  var callBack = (err, data) => {
    data.forEach(element => {
      date.push(element.user_months)
    });
    // console.log(date)
    if (err) {
      console.log("连接出错了")
    }
    else {
      res.send({
        'list': data,
        'date': date
      })
    }
  }
  dbCongif.sqlConnect(sql, sqlArr, callBack)
}
// -- 首页饼状图数据
getPieChart = (req, res) => {
  let sql = "SELECT * from (\
    (SELECT COUNT(user_id)as user_count_man FROM (SELECT users.user_id, usersInfo.user_sex FROM users\
     LEFT JOIN usersInfo ON usersInfo.user_id = users.user_id) as a\
    where a.user_sex ='男')as g,\
    (SELECT COUNT(user_id)as user_count_woman FROM (\
    SELECT users.user_id, usersInfo.user_sex FROM users\
    LEFT JOIN usersInfo ON usersInfo.user_id = users.user_id) as a\
    where a.user_sex ='女') as h)"
  var sqlArr = [];
  var callBack = (err, data) => {
    if (err) {
      console.log("连接出错了")
    }
    else {
      res.send({
        'list': data,
      })
    }
  }
  dbCongif.sqlConnect(sql, sqlArr, callBack)
}
// -- 管理员信息数据
getAdminInfo = (req, res) => {
  let sql = "SELECT * from administrators where administrator_tel = '17350228201'"
  var sqlArr = [];
  var callBack = (err, data) => {
    if (err) {
      console.log("连接出错了")
    }
    else {
      res.send({
        'list': data,
      })
    }
  }
  dbCongif.sqlConnect(sql, sqlArr, callBack)
}
module.exports = {
  getUser,
  getAdmin,
  getUserInfo,
  getRight,
  getWarningTriangle,
  getEquip_id,
  getCount,
  getLineChart,
  getPieChart,
  getAdminInfo

}
