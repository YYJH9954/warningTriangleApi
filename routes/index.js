var express = require('express');
var router = express.Router();
var db = require('../controllers/dbController')
/* GET home page. */
router.get('/getUser', db.getUser);
router.get('/getAdmin', db.getAdmin);
router.get('/getUserInfo', db.getUserInfo);
module.exports = router;

