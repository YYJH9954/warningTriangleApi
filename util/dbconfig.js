const mysql = require('mysql');
module.exports = {
  //数据库配置
  config: {
    host: 'rm-uf6j7qz8nw1nnd048125010dm.mysql.rds.aliyuncs.com',
    user: 'master123',
    password: 'ws19990413',
    database: '4g_message',
    port: '3306',
  },
  //连接数据库，使用mysql的连接方式
  //连接池对象
  sqlConnect: function (sql, sqlArr, callBack) {
    var pool = mysql.createPool(this.config)
    pool.getConnection((err, conn) => {
      console.log("数据库连接成功");
      if (err) {
        console.log("数据库连接失败");
        return;
      }
      //事件驱动回调
      conn.query(sql, sqlArr, callBack);
      //释放连接
      conn.release();
    })
  },
  //Promise回调
  SysqlConnect: function (sysql, sqlArr) {
    return new Promise((resolve, reject) => {
      var pool = mysql.createPool(this.config)
      pool.getConnection((err, conn) => {
        if (err) {
          console.log("连接失败");
          reject(err)
        }
        else {
          //事件驱动回调
          conn.query(sysql, sqlArr, (err, data) => {
            if (err) {
              reject(err)
            }
            else {
              resolve(data)
            }

          });
          //释放连接
          conn.release();
        }
      })

    }).catch((err) => {
      console.log(err)
    })
  }
}
