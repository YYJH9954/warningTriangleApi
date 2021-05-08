var express = require('express');
var router = express.Router();
var db = require('../controllers/dbController')
/* GET home page. */
router.get('/getUser', db.getUser);
router.get('/getAdmin', db.getAdmin);
router.get('/getUserInfo', db.getUserInfo);
router.get('/getRight', db.getRight);
router.get('/getWarningTriangle', db.getWarningTriangle);
router.get('/getEquip_id', db.getEquip_id);
router.get('/getCount', db.getCount);
router.get('/getLineChart', db.getLineChart);
router.get('/getPieChart', db.getPieChart);
router.get('/getAdminInfo', db.getAdminInfo);


module.exports = router;

