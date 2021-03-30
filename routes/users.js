var express = require('express');
var router = express.Router();
var User = require('../controllers/UserController')
/* GET users listing. */
router.post('/login', User.login);
router.post('/setPsd', User.setPsd);
router.post('/forgetPsd', User.forgetPsd);
router.post('/regUser', User.regUser);
router.get('/getGPS', User.getGPS);

module.exports = router;
